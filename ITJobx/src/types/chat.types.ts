export type SenderType = 'candidate' | 'bot' | 'agent';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId?: string;
  senderType: SenderType;
  message: string;
  messageType: 'text' | 'image' | 'document';
  attachmentUrl?: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversation {
  _id: string;
  candidateId: string;
  assignedAgentId?: string;
  status: 'bot' | 'waiting_for_agent' | 'agent_connected' | 'closed';
  lastMessage?: ChatMessage;
  unreadCountCandidate: number;
  unreadCountAgent: number;
  createdAt: string;
  updatedAt: string;
}
