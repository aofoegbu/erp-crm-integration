import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from './use-websocket';
import type { ChatSession, ChatMessage } from '@shared/schema';

export function useChat(sessionId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const queryClient = useQueryClient();
  const { sendMessage, subscribe } = useWebSocket(sessionId);

  // Fetch existing messages
  const { data: existingMessages } = useQuery({
    queryKey: ['/api/chat-sessions', sessionId, 'messages'],
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (existingMessages) {
      setMessages(existingMessages);
    }
  }, [existingMessages]);

  // WebSocket message handlers
  useEffect(() => {
    const unsubscribeNewMessage = subscribe('new_message', (data: any) => {
      setMessages(prev => [...prev, data.message]);
    });

    const unsubscribeTyping = subscribe('typing', (data: any) => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    return () => {
      unsubscribeNewMessage();
      unsubscribeTyping();
    };
  }, [subscribe]);

  // Send chat message
  const sendChatMessage = useMutation({
    mutationFn: async ({ message, sender, senderName }: { message: string; sender: string; senderName: string }) => {
      sendMessage('chat_message', {
        sessionId,
        message,
        sender,
        senderName
      });
    },
  });

  // Create new chat session
  const createSession = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest('POST', '/api/chat-sessions', sessionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat-sessions'] });
    },
  });

  const sendTypingIndicator = (sender: string) => {
    sendMessage('typing', { sender });
  };

  return {
    messages,
    isTyping,
    sendChatMessage,
    createSession,
    sendTypingIndicator,
  };
}
