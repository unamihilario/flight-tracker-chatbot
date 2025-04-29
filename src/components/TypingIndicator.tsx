
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-2 rounded-xl bg-muted w-fit max-w-[80%] message-bubble-bot">
      <div className="text-sm text-muted-foreground">
        🤖 TeoBot is typing
      </div>
      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-1"></span>
      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-2"></span>
      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-typing-dot-3"></span>
    </div>
  );
};

export default TypingIndicator;
