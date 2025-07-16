import React from "react";

// メッセージの型を定義
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatDisplayProps {
  chat: Message[];
  isLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatDisplay({
  chat,
  isLoading,
  chatEndRef,
}: ChatDisplayProps) {
  return (
    <div className="flex-grow w-full max-w-6xl mx-auto p-4 overflow-y-auto space-y-4">
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
                ? "bg-green-300 text-black"
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
  );
}
