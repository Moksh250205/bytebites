"use client";

import React from "react";

interface AiChatBubbleProps {
  content: string;
}

const AiChatBubble: React.FC<AiChatBubbleProps> = ({ content }) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2 max-w-[80%]">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default AiChatBubble;
