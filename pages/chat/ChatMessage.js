"use client";
import React from "react";

const ChatMessage = ({ text, type }) => {
  const isHuman = type === "human";

  return (
    <div className={`flex my-2 ${isHuman ? "justify-end" : "justify-start"}`}>
      <div>
        <div
          className={`w-auto md:max-w-3/4 rounded-tl-2xl rounded-tr-2xl px-4 py-2 ${
            isHuman
              ? "bg-[#f59953] text-white rounded-bl-2xl"
              : "bg-[#F5F5F5] text-gray-700 rounded-br-2xl"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm md:text-base">{isHuman?text:text}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
