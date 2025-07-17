"use client";

import React, { useState, useEffect, useRef } from "react";
import SubmitButton from "../components/ui/Button";
import TextInput from "../components/ui/Text";
import ChatDisplay from "../components/ui/Display";
import { useMessageSubmit, useResetChat } from "../lib/click";
import { fetchChatHistory } from "../lib/history";

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

  // phpとの連携 → phpを介してgeminiを呼び出す(chat_api.phpにgeminiAPIキーを書いている)
  // APIのURL(chat_api.phpの位置に注意)
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

  // カスタムフックを使用 → handleResetを取得
  const { handleReset } = useResetChat({
    setChat,
    apiUrl: API_URL,
  });

  // ページ読み込み時、履歴を取得
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await fetchChatHistory(API_URL);
        setChat(history);
      } catch (error) {
        console.error("履歴の取得に失敗しました:", error);
      }
    };
    loadHistory();
  }, []);

  // メッセージが追加される場合、一番下までスクロール
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  // AIメッセージに「もっと熱くなれよ」が含まれているか
  // ↓ (松岡修造の口調にするかどうか)
  const shouldShowMatuoka = () => {
    if (chat.length === 0) return false;

    for (let i = chat.length - 1; i >= 0; i--) {
      if (chat[i].role === "assistant") {
        return chat[i].content.includes("もっと熱くなれよ");
      }
    }
    return false;
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 font-sans">
        <div className="flex flex-col w-full max-w-2xl h-[90vh] bg-white rounded-xl shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-2xl font-bold text-gray-800 flex-grow text-center">
              AIチャット
            </h1>
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
            >
              リセット
            </button>
          </div>

          {/* 表示エリア */}
          <ChatDisplay
            chat={chat}
            isLoading={isLoading}
            chatEndRef={chatEndRef}
            shouldShowMatuoka={shouldShowMatuoka}
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
