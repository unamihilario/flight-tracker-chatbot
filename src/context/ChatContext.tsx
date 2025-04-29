
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { api } from '@/services/api';
import { toast } from "@/components/ui/sonner";

// Define the types for our messages
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  options?: string[];
}

// Define the context type
interface ChatContextType {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (text: string) => void;
  selectOption: (option: string) => void;
  currentState: string;
}

// Create the context with a default value
const ChatContext = createContext<ChatContextType>({
  messages: [],
  isTyping: false,
  sendMessage: () => {},
  selectOption: () => {},
  currentState: 'initial'
});

// Custom hook to use the chat context
export const useChat = () => useContext(ChatContext);

// Chat states
const STATES = {
  INITIAL: 'initial',
  AWAITING_FLIGHT_TYPE: 'awaiting_flight_type',
  AWAITING_AIRPORT: 'awaiting_airport',
  AWAITING_FLIGHT_NUMBER: 'awaiting_flight_number',
  TRACKING_FLIGHT: 'tracking_flight',
  CHATTING: 'chatting'
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentState, setCurrentState] = useState(STATES.INITIAL);
  
  // Store for conversation context
  const [flightType, setFlightType] = useState('');
  const [selectedAirport, setSelectedAirport] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initialize chat with welcome message
  useEffect(() => {
    const initChat = async () => {
      setIsTyping(true);
      const welcomeMessage = "👋 Hi! I'm TeoBot, your AI flight assistant. I can help you track flights in real-time and answer your travel questions. How can I assist you today?";
      addBotMessage(welcomeMessage, ["Track a Flight", "Chat with TeoBot"]);
      setIsTyping(false);
    };

    initChat();
  }, []);

  // Add a user message
  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Add a bot message
  const addBotMessage = (text: string, options?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: false,
      options
    };
    setMessages(prev => [...prev, newMessage]);
  };

  // Handle sending a message
  const sendMessage = async (text: string) => {
    addUserMessage(text);
    setIsTyping(true);
    
    try {
      if (currentState === STATES.AWAITING_FLIGHT_NUMBER) {
        // Track flight using real API
        const response = await api.trackFlight(text);
        
        if (response.flight) {
          const formattedMessage = `
Flight Status for ${response.flight.flightNumber} (${response.flight.airline}):
Status: ${response.flight.status}
Departure: ${response.flight.departure.airport.name} (${response.flight.departure.airport.iataCode})
Departure Time: ${new Date(response.flight.departure.scheduledTime).toLocaleString()}
Gate: ${response.flight.departure.gate || 'TBA'}
Terminal: ${response.flight.departure.terminal || 'TBA'}

Arrival: ${response.flight.arrival.airport.name} (${response.flight.arrival.airport.iataCode})
Arrival Time: ${new Date(response.flight.arrival.scheduledTime).toLocaleString()}
Gate: ${response.flight.arrival.gate || 'TBA'}
Terminal: ${response.flight.arrival.terminal || 'TBA'}

Would you like to track another flight?`;

          addBotMessage(formattedMessage, ["Track Another Flight", "Chat with TeoBot"]);
        } else {
          addBotMessage("I couldn't find that flight. Please check the flight number and try again.", ["Track Another Flight", "Chat with TeoBot"]);
        }
        setCurrentState(STATES.TRACKING_FLIGHT);
      } else {
        // Use Gemini AI for chat
        const response = await api.chatWithBot(text);
        addBotMessage(response.message);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Show a toast notification
      toast.error("Error", {
        description: "Couldn't process your request. Please try again."
      });
      
      // Add a helpful message to the chat
      if (currentState === STATES.AWAITING_FLIGHT_NUMBER) {
        addBotMessage("I had trouble tracking that flight. Please try with a standard airline code and flight number format (e.g., 'BA123' for British Airways flight 123).", ["Track Another Flight", "Chat with TeoBot"]);
        setCurrentState(STATES.TRACKING_FLIGHT);
      } else {
        addBotMessage('Sorry, I had trouble processing your request. Please try again.');
      }
    }
    
    setIsTyping(false);
  };

  // Handle option selection
  const selectOption = async (option: string) => {
    addUserMessage(option);
    setIsTyping(true);
    
    try {
      // Logic for option selection based on current state
      if (currentState === STATES.INITIAL) {
        if (option === 'Track a Flight') {
          const response = await api.getFlightTypeOptions();
          addBotMessage(response.message, response.options);
          setCurrentState(STATES.AWAITING_FLIGHT_TYPE);
        } else if (option === 'Chat with TeoBot') {
          addBotMessage('Great! What would you like to chat about?');
          setCurrentState(STATES.CHATTING);
        }
      } 
      else if (currentState === STATES.AWAITING_FLIGHT_TYPE) {
        setFlightType(option);
        const response = await api.getAirportOptions(option);
        addBotMessage(response.message, response.options);
        setCurrentState(STATES.AWAITING_AIRPORT);
      } 
      else if (currentState === STATES.AWAITING_AIRPORT) {
        setSelectedAirport(option);
        const response = await api.askForFlightNumber(option);
        addBotMessage(response.message + " (e.g., BA123 for British Airways flight 123)");
        setCurrentState(STATES.AWAITING_FLIGHT_NUMBER);
      }
      else if (currentState === STATES.TRACKING_FLIGHT) {
        if (option === 'Track Another Flight') {
          const response = await api.getFlightTypeOptions();
          addBotMessage(response.message, response.options);
          setCurrentState(STATES.AWAITING_FLIGHT_TYPE);
        } else if (option === 'Chat with TeoBot') {
          addBotMessage('Great! What would you like to chat about?');
          setCurrentState(STATES.CHATTING);
        }
      }
    } catch (error) {
      console.error('Error handling option selection:', error);
      toast.error("Error", {
        description: "Couldn't process your selection. Please try again."
      });
      addBotMessage('Sorry, I had trouble processing your selection. Please try again.');
    }
    
    setIsTyping(false);
  };

  return (
    <ChatContext.Provider value={{ 
      messages, 
      isTyping, 
      sendMessage, 
      selectOption,
      currentState
    }}>
      {children}
      <div ref={messagesEndRef} />
    </ChatContext.Provider>
  );
};
