const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatMessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
    },
    senderType: {
      type: String,
      enum: ['candidate', 'bot', 'agent'],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'document'],
      default: 'text',
    },
    attachmentUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for scrolling/fetching messages sorted by date
ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
