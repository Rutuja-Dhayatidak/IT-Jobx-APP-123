import { apiRequest } from './api';
import { ChatConversation, ChatMessage } from '../types/chat.types';

export const chatApi = {
  /**
   * Fetches the candidate's active support conversation or creates one if it doesn't exist.
   */
  getOrCreateConversation: async (): Promise<{ success: boolean; conversation: ChatConversation }> => {
    return apiRequest('/chat/conversation', {
      method: 'GET',
    });
  },

  /**
   * Fetches paginated messages for a support conversation.
   */
  getMessages: async (
    conversationId: string,
    page: number = 1,
    limit: number = 30
  ): Promise<{ success: boolean; messages: ChatMessage[] }> => {
    return apiRequest(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },

  /**
   * Sends a user chat message.
   */
  sendMessage: async (
    conversationId: string,
    message: string,
    messageType: 'text' | 'image' | 'document' = 'text',
    attachmentUrl?: string
  ): Promise<{ success: boolean; message: ChatMessage; botResponse?: ChatMessage }> => {
    return apiRequest(`/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, messageType, attachmentUrl }),
    });
  },

  /**
   * Sends a quick action command query.
   */
  sendQuickAction: async (
    conversationId: string,
    action: string
  ): Promise<{ success: boolean; message: ChatMessage; botResponse?: ChatMessage }> => {
    return apiRequest(`/chat/conversations/${conversationId}/quick-action`, {
      method: 'POST',
      body: JSON.stringify({ message: action }),
    });
  },

  /**
   * Requests transferring the conversation to a human support agent.
   */
  requestAgent: async (conversationId: string): Promise<{ success: boolean; conversation: ChatConversation }> => {
    return apiRequest(`/chat/conversations/${conversationId}/request-agent`, {
      method: 'POST',
    });
  },

  /**
   * Marks all messages in a conversation as read.
   */
  markAsRead: async (conversationId: string): Promise<{ success: boolean; message: string }> => {
    return apiRequest(`/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Retrieves the unread message count.
   */
  getUnreadCount: async (): Promise<{ success: boolean; unreadCount: number }> => {
    return apiRequest('/chat/unread-count', {
      method: 'GET',
    });
  },
};
