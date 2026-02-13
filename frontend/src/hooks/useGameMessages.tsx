import { useState, useCallback } from "react";

export const useGameMessages = () => {
  const [messages, setMessages] = useState<string[]>([]);

  const showMessage = useCallback((message: string) => {
    setMessages((prev) => [...prev, message].slice(-5)); // Keep last 5 messages
    setTimeout(() => {
      setMessages((prev) => prev.slice(1));
    }, 3000);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    showMessage,
    clearMessages,
  };
};
