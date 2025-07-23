import React from "react";
import Image from "next/image";

// メッセージの型を定義
interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatDisplayProps {
  chat: Message[];
  isLoading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  shouldShowMatuoka: () => boolean;
}

export default function ChatDisplay({
  chat,
  isLoading,
  chatEndRef,
  shouldShowMatuoka,
}: ChatDisplayProps) {
  // 個別のメッセージに「もっと熱くなれよ」が含まれているかチェック
  const shouldShowMatuokaForMessage = (message: string) => {
    return message.includes("もっと熱くなれよ");
  };

  return (
    <div className="flex-grow w-full max-w-6xl mx-auto p-4 overflow-y-auto space-y-4">
      {chat.map((msg, index) => (
        <div
          key={index}
          className={`flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          } items-start`}
        >
          {/* AIメッセージの場合はアバター画像を表示 */}
          {msg.role === "assistant" && (
            <div className="flex-shrink-0 mr-2">
              <Image
                src={
                  shouldShowMatuokaForMessage(msg.content)
                    ? "/img/matuoka.jpg"
                    : "/img/woman.png"
                }
                alt={
                  shouldShowMatuokaForMessage(msg.content)
                    ? "松岡修造"
                    : "お姉さん"
                }
                width={32}
                height={32}
                className="rounded-full object-cover w-8 h-8"
              />
            </div>
          )}
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
        <div className="flex justify-start items-start">
          <div className="flex-shrink-0 mr-2">
            <Image
              src={shouldShowMatuoka() ? "/img/matuoka.jpg" : "/img/woman.png"}
              alt={shouldShowMatuoka() ? "松岡修造" : "お姉さん"}
              width={32}
              height={32}
              className="rounded-full object-cover w-8 h-8"
            />
          </div>
          <div className="px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
            <span className="animate-pulse">考え中...</span>
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
}
