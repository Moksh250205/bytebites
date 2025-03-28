"use client";

import React from "react";
import UserChatBubble from "./UserChatBubble";
import AiChatBubble from "./AiChatBubble";
import type { Message } from "@/types/frontend/types";

interface ChatComponentProps {
  messages: Message[];
}

const ChatComponent: React.FC<ChatComponentProps> = ({ messages }) => {
  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message, index) =>
        message.type === "user" ? (
          <UserChatBubble key={index} content={message.content} />
        ) : (
          <AiChatBubble key={index} content={message.content} />
        )
      )}
    </div>
  );
};

export default ChatComponent;
