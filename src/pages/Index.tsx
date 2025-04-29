
import React from 'react';
import ChatHeader from '@/components/ChatHeader';
import ChatInput from '@/components/ChatInput';
import MessageBubble from '@/components/MessageBubble';
import TypingIndicator from '@/components/TypingIndicator';
import { ChatProvider, useChat } from '@/context/ChatContext';

// Chat component that displays the chat interface
const Chat = () => {
  const { messages, isTyping, sendMessage, selectOption, currentState } = useChat();
  
  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            text={message.text}
            isUser={message.isUser}
            options={message.options}
            onOptionClick={selectOption}
          />
        ))}
        
        {isTyping && <TypingIndicator />}
      </div>
      
      <ChatInput 
        onSendMessage={sendMessage} 
        disabled={isTyping || 
          currentState === 'initial' || 
          currentState === 'awaiting_flight_type' ||
          currentState === 'awaiting_airport'}
      />
    </div>
  );
};

// Main page component wrapped with the ChatProvider
const Index = () => {
  return (
    <div className="container mx-auto max-w-2xl h-screen bg-background shadow-lg">
      <ChatProvider>
        <Chat />
      </ChatProvider>
    </div>
  );
};

export default Index;
