"use client";

// import { Messages } from "openai/resources/chat/completions.js";
import React, { useState, useEffect, useRef } from "react";

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

  // 送信ボタンのクリックイベント
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 初期動作のキャンセル
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    // UIへの反映
    const newMessages = [...chat, userMessage];
    setChat(newMessages);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    //   // Gemini APIに送信するための会話履歴を準備
    //   const chatHistoryForApi = newMessages.map((msg) => ({
    //     role: msg.role === "assistant" ? "model" : "user",
    //     parts: [{ text: msg.content }],
    //   }));

    //   // APIペイロードを作成
    //   const payload = {
    //     contents: chatHistoryForApi,
    //   };

    //   try {
    //     // Gemini APIを直接呼び出す
    //     // gemini-2.0-flashモデルを使用する → APIキーはを直接指定する → Google AI Studio で生成したapiキーを入力
    //     const apiKey = "AIzaSyArl9NmO78fBisVQKzNvYelsnqMJhSalKw";
    //     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    //     const response = await fetch(apiUrl, {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(payload),
    //     });

    //     if (!response.ok) {
    //       const errorBody = await response.text();
    //       throw new Error(
    //         `APIリクエストが失敗しました。ステータス: ${response.status}, 本文: ${errorBody}`
    //       );
    //     }

    //     const result = await response.json();

    //     let assistantMessageContent =
    //       "申し訳ありませんが、応答を取得できませんでした。";
    //     // APIからの応答を安全に解析
    //     if (
    //       result.candidates &&
    //       result.candidates.length > 0 &&
    //       result.candidates[0].content &&
    //       result.candidates[0].content.parts &&
    //       result.candidates[0].content.parts.length > 0
    //     ) {
    //       assistantMessageContent = result.candidates[0].content.parts[0].text;
    //     }

    //     const assistantMessage: Message = {
    //       role: "assistant",
    //       content: assistantMessageContent,
    //     };

    //     setChat((prev) => [...prev, assistantMessage]);
    //   } catch (error) {
    //     console.error("API呼び出しエラー:", error);
    //     const errorMessage: Message = {
    //       role: "assistant",
    //       content:
    //         "エラーが発生しました。しばらくしてからもう一度お試しください。",
    //     };
    //     setChat((prev) => [...prev, errorMessage]);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

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
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {chat.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {/* 改行を適切に表示するためにwhite-spaceを使用 */}
                  <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                  <span className="animate-pulse">考え中...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* 入力フォーム(テキストボックス・ボタン) */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className=" flex gap-2">
              <input
                type="text"
                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="メッセージを入力してください"
                // 入力値をinputで管理
                value={input}
                // onChangeイベントにより、入力されると随時値を取得
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
              />
              <input
                type="submit"
                // isLoadingの状態によって、表示を切り替える
                value={isLoading ? "送信中..." : "送信"}
                className={`px-6 py-3 font-semibold text-white rounded-lg cursor-pointer transition
                ${isLoading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
                disabled={isLoading}
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
