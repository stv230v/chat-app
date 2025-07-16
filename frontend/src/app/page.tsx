"use client";

import React, { useState, useEffect, useRef } from "react";
import SubmitButton from "../components/ui/Button";
import TextInput from "../components/ui/Text";
import ChatDisplay from "../components/ui/Display";

// メッセージの型を定義
interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [input, setInput] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // phpとの連携 → phpを介してgeminiを呼び出す
  // apiファイルに入れているため、localhost/「api」を忘れずに指定する必要あり
  const API_URL = "http://localhost/api/chat_api.php";

  // ページ読み込み時に履歴を取得する
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_history" }),
        });
        const historyData = await response.json();
        if (Array.isArray(historyData)) {
          const formattedHistory: Message[] = historyData.flatMap((entry) => [
            { role: "user", content: entry.user },
            { role: "assistant", content: entry.assistant },
          ]);
          setChat(formattedHistory);
        }
      } catch (error) {
        console.error("履歴の取得に失敗しました:", error);
      }
    };
    fetchHistory();
  }, []);

  // メッセージが追加されると一番下までスクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // 送信ボタンのクリックイベント
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 初期動作のキャンセル
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    // ↓ UIへの反映部分
    const newMessages = [...chat, userMessage];
    setChat(newMessages);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // fetchの宛先をphpに変更する
      // 送信データを変更
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_message",
          message: currentInput,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `APIリクエストが失敗しました。ステータス: ${response.status}, 本文: ${errorBody}`
        );
      }

      const result = await response.json();
      // PHPからの返信を取得
      const assistantMessage: Message = {
        role: "assistant",
        content: result.reply,
      };

      // AIの応答を、PHPから返ってくる確定した値で更新
      setChat((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("API呼び出しエラー:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "エラーが発生しました。PHPサーバーとの通信を確認してください。",
      };

      // ユーザーのメッセージを一旦削除
      setChat((prev) => [...prev.slice(0, -1), errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans">
        <div className="flex flex-col w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-2xl">
          <h1 className="p-4 text-2xl font-bold text-center text-gray-800 border-b">
            AIチャット
          </h1>

          {/* 表示エリア */}
          <ChatDisplay
            chat={chat}
            isLoading={isLoading}
            chatEndRef={chatEndRef}
          />

          {/* 入力フォーム(テキストボックス・ボタン) */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className=" flex gap-2">
              <TextInput
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力してください"
                disabled={isLoading}
              />
              <SubmitButton
                isLoading={isLoading}
                disabled={isLoading}
                loadingText="送信中..."
                defaultText="送信"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
