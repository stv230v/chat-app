"use client";

import React, { useState } from "react";

export default function Home() {
  const [input, setInput] = useState<string>("");

  const [chat, setChat] = useState<string>("");

  // 送信ボタンのクリックイベント
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // 初期動作のキャンセル
    e.preventDefault();

    // 入力値の取得, 初期化
    setChat(input);
    setInput("");
  };

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            チャット
          </h1>
          <div
            id="chat"
            className="w-full h-80 p-4 overflow-y-auto border border-gray-300 rounded-lg bg-gray-100"
          >
            {chat ? <p>{chat}</p> : <p>メッセージの表示</p>}
          </div>
          <form onSubmit={handleSubmit} className=" flex gap-2">
            <input
              type="text"
              name="input"
              id="input"
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="メッセージを入力してください"
              // 入力値をinputで管理
              value={input}
              // onChangeイベントにより、入力されると随時値を取得
              onChange={(e) => setInput(e.target.value)}
            />
            <input
              type="submit"
              value="送信"
              className="bg-blue-500 hover:bg-blue-600 rounded-sm w-20"
            />
          </form>
        </div>
      </div>
    </div>
  );
}
