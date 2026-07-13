const ChatConversation = require('../models/ChatConversation');
const ChatMessage = require('../models/ChatMessage');
const chatbotService = require('../services/chatbotService');
const { emitNotification } = require('../utils/socketService');

// Helper to sanitize input string
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/<[^>]*>/g, ''); // basic HTML tag stripping
};

// 1. Get or create candidate's active conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const candidateId = req.user.id;

    // Try to find an open or active support conversation
    let conversation = await ChatConversation.findOne({
      candidateId,
      status: { $ne: 'closed' }
    }).populate('lastMessage');

    if (!conversation) {
      // Create a brand new conversation
      conversation = await ChatConversation.create({
        candidateId,
        status: 'bot',
        unreadCountCandidate: 1 // Start with a welcome message unread
      });

      // Save a welcome message from the bot
      const welcomeMessage = await ChatMessage.create({
        conversationId: conversation._id,
        senderType: 'bot',
        message: 'Hello! Welcome to ITJobX Candidate Support. How can I help you today? Feel free to ask about your Application Status, Resume Help, Interview Support, Job Search, or Account Help.',
        status: 'delivered',
      });

      conversation.lastMessage = welcomeMessage._id;
      await conversation.save();

      // Populate again
      conversation = await ChatConversation.findById(conversation._id).populate('lastMessage');
    }

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get messages with pagination
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    // Verify ownership
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    if (conversation.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized conversation access' });
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Reverse to chronological order for client display
    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Send message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const rawMessage = req.body.message;
    const messageType = req.body.messageType || 'text';
    const attachmentUrl = req.body.attachmentUrl || '';

    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const message = sanitizeString(rawMessage);
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 2000 characters' });
    }

    // Verify ownership
    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    if (conversation.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied: Unauthorized conversation access' });
    }

    // A. Create the Candidate message
    const candidateMsg = await ChatMessage.create({
      conversationId,
      senderId: req.user.id,
      senderType: 'candidate',
      message,
      messageType,
      attachmentUrl,
      status: 'sent'
    });

    conversation.lastMessage = candidateMsg._id;
    conversation.unreadCountAgent += 1;
    await conversation.save();

    // Broadcast candidate message to agent room / user room
    emitNotification(`conversation_${conversationId}`, 'new_message', candidateMsg);

    let botResponseMsg = null;

    // B. Handle Bot responses if conversation status is 'bot', 'waiting_for_agent' or 'agent_connected'
    if (['bot', 'waiting_for_agent', 'agent_connected'].includes(conversation.status)) {
      if (conversation.status !== 'bot') {
        conversation.status = 'bot';
        await conversation.save();
      }

      const botResponse = await chatbotService.getBotResponse(message, req.user.id);

      // Create Bot response message
      botResponseMsg = await ChatMessage.create({
        conversationId,
        senderType: 'bot',
        message: botResponse.reply,
        status: 'delivered',
        metadata: botResponse.metadata || {}
      });

      conversation.lastMessage = botResponseMsg._id;
      conversation.unreadCountCandidate += 1;
      await conversation.save();

      // Emit bot response
      setTimeout(() => {
        emitNotification(`conversation_${conversationId}`, 'new_message', botResponseMsg);
        emitNotification(`candidate_${req.user.id}`, 'unread_count_updated', { unreadCount: conversation.unreadCountCandidate });
      }, 800); // Simulate bot typing delay
    }

    res.status(201).json({
      success: true,
      message: candidateMsg,
      botResponse: botResponseMsg
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Send quick action predefined message
exports.sendQuickAction = async (req, res) => {
  req.body.messageType = 'text';
  return exports.sendMessage(req, res);
};

// 5. Transfer conversation to a human support agent
exports.requestAgent = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    if (conversation.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    conversation.status = 'waiting_for_agent';
    
    // Create bot system announcement
    const announcementMsg = await ChatMessage.create({
      conversationId,
      senderType: 'bot',
      message: 'Connecting to a support representative... An agent will join this chat soon. Thank you for your patience.',
      status: 'delivered',
    });

    conversation.lastMessage = announcementMsg._id;
    conversation.unreadCountCandidate += 1;
    await conversation.save();

    emitNotification(`conversation_${conversationId}`, 'conversation_status_updated', { status: 'waiting_for_agent' });
    emitNotification(`conversation_${conversationId}`, 'new_message', announcementMsg);
    emitNotification(`candidate_${req.user.id}`, 'unread_count_updated', { unreadCount: conversation.unreadCountCandidate });

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Mark conversation messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    if (conversation.candidateId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Reset Candidate's unread counts
    conversation.unreadCountCandidate = 0;
    await conversation.save();

    // Mark agent/bot messages as read
    await ChatMessage.updateMany(
      {
        conversationId,
        senderType: { $ne: 'candidate' },
        status: { $ne: 'read' }
      },
      { $set: { status: 'read' } }
    );

    emitNotification(`conversation_${conversationId}`, 'message_status_updated', { status: 'read' });
    emitNotification(`candidate_${req.user.id}`, 'unread_count_updated', { unreadCount: 0 });

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Get unread message count for bottom navigation badge
exports.getUnreadCount = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const conversation = await ChatConversation.findOne({
      candidateId,
      status: { $ne: 'closed' }
    });

    const unreadCount = conversation ? conversation.unreadCountCandidate : 0;
    res.json({ success: true, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
