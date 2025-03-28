"use client";

import React from "react";

interface UserChatBubbleProps {
  content: string;
}

const UserChatBubble: React.FC<UserChatBubbleProps> = ({ content }) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
        <p>{content}</p>
      </div>
    </div>
  );
};

export default UserChatBubble;
