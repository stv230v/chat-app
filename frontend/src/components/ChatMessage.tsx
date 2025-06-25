"use client";

import React from "react";
import { useRecoilState } from "recoil";
import { chatLogState } from "../states/ChatLogState";

type MessageType = {
  id: number;
  content: string;
  sender: string;
};

const ChatMessage = () => {
  const [chatLog, setChatLog] = useRecoilState(chatLogState);

  return (
    <>
      {chatLog.map((message: MessageType) => {
        return (
          <div
            key={message.id}
            className={`flex items-end ${
              message.sender === "user" ? "justify-end" : ""
            }`}
          >
            {message.sender === "other" && (
              <div className="flex-shrink-0 mr-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full" />
              </div>
            )}
            <div
              className={`rounded p-2 ${
                message.sender === "user" ? "bg-blue-500" : "bg-gray-500"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ChatMessage;
