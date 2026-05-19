import { useState, useEffect, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient';
import { useAuth } from '@/contexts/AuthContext.jsx';

export const useAIAssistant = (currentPage) => {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_chat_history');
      return saved ? JSON.parse(saved) : [{ role: 'ai', text: 'Hello! I am the IWS Assistant. How can I help you today?', actions: [] }];
    } catch (e) {
      return [{ role: 'ai', text: 'Hello! I am the IWS Assistant. How can I help you today?', actions: [] }];
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('ai_chat_history', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await apiServerClient.fetch('/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: currentUser?.id || 'anonymous',
          currentPage,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch IWS Assistant response');
      }
      
      const data = await response.json();

      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.response,
        actions: data.actions || []
      }]);
    } catch (error) {
      console.error('IWS Assistant Error:', error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Sorry, I encountered an error connecting to the server. Please try again later.', 
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = useCallback(() => {
    setMessages([{ role: 'ai', text: 'Hello! I am the IWS Assistant. How can I help you today?', actions: [] }]);
    localStorage.removeItem('ai_chat_history');
  }, []);

  return { messages, sendMessage, isLoading, clearHistory };
};