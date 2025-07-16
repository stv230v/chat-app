"use client";

import React, { useState, useEffect, useRef } from "react";
import SubmitButton from "../components/ui/Button";
import TextInput from "../components/ui/Text";
import ChatDisplay from "../components/ui/Display";
import { useMessageSubmit } from "../lib/click";

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
  const API_URL = "http://localhost/api/chat_api.php";

  // カスタムフックを使用してhandleSubmitを取得
  const { handleSubmit } = useMessageSubmit({
    input,
    setInput,
    chat,
    setChat,
    isLoading,
    setIsLoading,
    apiUrl: API_URL,
  });

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
