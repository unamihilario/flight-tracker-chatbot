
import React from 'react';

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  options?: string[];
  onOptionClick?: (option: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  text, 
  isUser, 
  options,
  onOptionClick 
}) => {
  const bubbleClass = isUser 
    ? "message-bubble-user ml-auto" 
    : "message-bubble-bot";

  return (
    <div className="mb-4 message-appear">
      <div className={`${bubbleClass} px-4 py-2 max-w-[80%] text-sm text-foreground shadow-sm`}>
        {text}
      </div>
      
      {!isUser && options && options.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => onOptionClick && onOptionClick(option)}
              className="bg-secondary text-foreground px-3 py-1 rounded-full text-sm hover:bg-secondary/80 transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
