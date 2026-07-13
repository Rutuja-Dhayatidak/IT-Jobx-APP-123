import { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore
import io from 'socket.io-client/dist/socket.io.js';
import type { Socket } from 'socket.io-client';
import { chatApi } from '../services/chatApi';
import { getToken } from '../services/api';
import { ChatConversation, ChatMessage } from '../types/chat.types';

export function useChat() {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // Initialize and load conversation details
  const initConversation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await chatApi.getOrCreateConversation();
      if (res.success && res.conversation) {
        setConversation(res.conversation);
        
        // Load initial messages page
        const msgRes = await chatApi.getMessages(res.conversation._id, 1);
        if (msgRes.success) {
          setMessages(msgRes.messages);
          setHasMore(msgRes.messages.length >= 30);
          setPage(1);
        }
        
        // Mark as read initially
        await chatApi.markAsRead(res.conversation._id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to support chat.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Pull-to-refresh handler
  const onRefresh = async () => {
    if (!conversation) return;
    try {
      setRefreshing(true);
      const msgRes = await chatApi.getMessages(conversation._id, 1);
      if (msgRes.success) {
        setMessages(msgRes.messages);
        setHasMore(msgRes.messages.length >= 30);
        setPage(1);
      }
    } catch (err) {
      console.error('Error refreshing messages:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Load older messages for pagination
  const loadMoreMessages = async () => {
    if (!conversation || !hasMore || loading) return;
    try {
      const nextPage = page + 1;
      const msgRes = await chatApi.getMessages(conversation._id, nextPage);
      if (msgRes.success) {
        if (msgRes.messages.length > 0) {
          setMessages((prev) => [...msgRes.messages, ...prev]);
          setPage(nextPage);
          setHasMore(msgRes.messages.length >= 30);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Error loading older messages:', err);
    }
  };

  // Send a new message
  const sendMessage = async (text: string) => {
    if (!conversation || !text.trim()) return;

    // A. Optimistic UI Update
    const tempId = `temp-${Date.now()}`;
    const tempMessage: ChatMessage = {
      _id: tempId,
      conversationId: conversation._id,
      senderType: 'candidate',
      message: text.trim(),
      messageType: 'text',
      status: 'sending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setSending(true);

    try {
      // Send message to server via API
      const res = await chatApi.sendMessage(conversation._id, text.trim());
      if (res.success && res.message) {
        // B. Replace temporary sending bubble with real saved message
        setMessages((prev) => {
          if (prev.some((m) => m._id === res.message._id)) {
            // Already added by socket listener, remove temp message
            return prev.filter((msg) => msg._id !== tempId);
          }
          return prev.map((msg) => (msg._id === tempId ? res.message : msg));
        });
        
        // C. If bot replied, it will be in the response
        if (res.botResponse) {
          // Add small simulated delay for natural feel
          setTimeout(() => {
            setMessages((prev) => {
              // Ensure we don't add duplicate if socket already received it
              if (prev.some((m) => m._id === res.botResponse?._id)) return prev;
              return [...prev, res.botResponse!];
            });
          }, 600);
        }
      }
    } catch (err) {
      // D. Mark message as failed
      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? { ...msg, status: 'failed' } : msg))
      );
    } finally {
      setSending(false);
    }
  };

  // Retry sending a failed message
  const retryMessage = async (tempId: string, text: string) => {
    // Remove the failed message
    setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    // Send it fresh
    await sendMessage(text);
  };

  // Request a human agent transfer
  const requestAgentTransfer = async () => {
    if (!conversation) return;
    try {
      setLoading(true);
      const res = await chatApi.requestAgent(conversation._id);
      if (res.success && res.conversation) {
        setConversation(res.conversation);
      }
    } catch (err) {
      console.error('Failed to request human support:', err);
    } finally {
      setLoading(false);
    }
  };

  // Setup WebSockets / Socket.io real-time connection
  useEffect(() => {
    const token = getToken();
    if (!token || !conversation) return;

    // Connect to Socket.io backend server
    const socket = io('http://localhost:5001', {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Join active conversation room
      socket.emit('join_conversation', conversation._id);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time message receiver
    socket.on('new_message', (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      // Mark message as read on server if screen is active
      chatApi.markAsRead(conversation._id).catch(console.error);
    });

    // Message status sync (e.g. read status update)
    socket.on('message_status_updated', (data: { status: 'read' }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.senderType === 'candidate' ? { ...msg, status: 'read' } : msg))
      );
    });

    // Typing indicators from Bot/Agent
    socket.on('agent_typing', (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    // Conversation status sync (e.g. waiting_for_agent, agent_connected)
    socket.on('conversation_status_updated', (data: { status: any }) => {
      setConversation((prev) => (prev ? { ...prev, status: data.status } : null));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversation?._id]);

  // Load conversation details on mount
  useEffect(() => {
    initConversation();
  }, [initConversation]);

  // Trigger typing indicators (client-side mock or socket emitters)
  const setClientTypingStatus = (typing: boolean) => {
    if (!socketRef.current || !conversation) return;
    if (typing) {
      socketRef.current.emit('typing_start', conversation._id);
    } else {
      socketRef.current.emit('typing_stop', conversation._id);
    }
  };

  return {
    conversation,
    messages,
    loading,
    refreshing,
    sending,
    isTyping,
    error,
    isConnected,
    onRefresh,
    loadMoreMessages,
    sendMessage,
    retryMessage,
    requestAgentTransfer,
    setClientTypingStatus,
    retryInit: initConversation,
  };
}
