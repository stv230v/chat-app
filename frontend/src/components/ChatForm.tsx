"use client";

import React, { useState } from "react";
import { useRecoilState, useResetRecoilState } from "recoil";
import { chatLogState } from "../states/ChatLogState";

const ChatForm = () => {
  const [input, setInput] = useState<string>("");
  const [chatLog, setChatLog] = useRecoilState(chatLogState);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newId = chatLog.length > 0 ? chatLog[chatLog.length - 1].id + 1 : 1;

    const newUserMessage = { id: newId, Content: input, sender: "user" };
    const updatedMessages = [...chatLog, newUserMessage];
    setChatLog(updatedMessages);
    setInput("");

    try {
      const res = await fetch(`/api/response`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        throw new Error("Response error");
      }

      const result = await res.json();
      const newGptId = newId + 1;
      const newGptMessage = {
        id: newGptId,
        content: result.gptResponseMessage,
        sender: "other",
      };
      setChatLog([...updatedMessages, newGptMessage]);
    } catch (error) {
      console.error("Error fetching GPT response:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-gray-400 flex justify-between items-center"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="メッセージを入力してください"
        className="flex-grow px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-green-200"
      >
        送信
      </button>
    </form>
  );
};

export default ChatForm;
