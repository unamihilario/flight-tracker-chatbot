
import React from 'react';

const ChatHeader = () => {
  return (
    <div className="flex items-center p-4 border-b border-border bg-card">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl">
          🤖
        </div>
        <div className="ml-3">
          <h2 className="font-semibold text-lg">TeoBot</h2>
          <p className="text-xs text-muted-foreground">Flight Assistant & Chat</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
