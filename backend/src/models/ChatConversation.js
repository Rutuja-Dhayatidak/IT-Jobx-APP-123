const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatConversationSchema = new Schema(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
      index: true,
    },
    assignedAgentId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser', // Support agents are usually admins
      index: true,
    },
    status: {
      type: String,
      enum: ['bot', 'waiting_for_agent', 'agent_connected', 'closed'],
      default: 'bot',
      index: true,
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'ChatMessage',
    },
    unreadCountCandidate: {
      type: Number,
      default: 0,
    },
    unreadCountAgent: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// One active support conversation per candidate
ChatConversationSchema.index({ candidateId: 1, status: 1 });

module.exports = mongoose.model('ChatConversation', ChatConversationSchema);
