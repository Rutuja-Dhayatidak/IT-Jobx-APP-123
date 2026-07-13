let ioInstance = null;

/**
 * Initializes Socket.io connection listeners and registers the socket instance
 * @param {Object} io - Socket.io Server Instance
 */
const jwt = require('jsonwebtoken');
const ChatConversation = require('../models/ChatConversation');

const initSocket = (io) => {
  ioInstance = io;

  // Middleware to authenticate socket connections using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} 🔌`);

    // Let clients register themselves to specific notification rooms (e.g., 'company_XYZ', 'super_admin', 'finance_admin')
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
    });

    // Register candidate to their own personal room for unread badges
    if (socket.user && socket.user.id) {
      socket.join(`candidate_${socket.user.id}`);
      console.log(`Candidate ${socket.user.id} joined personal room`);
    }

    // Join Support Conversation Room (with authorization check!)
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await ChatConversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error', 'Conversation not found');
        }
        
        // Prevent candidates from joining other users' conversations
        if (conversation.candidateId.toString() !== socket.user.id) {
          return socket.emit('error', 'Unauthorized access to this conversation');
        }

        socket.join(`conversation_${conversationId}`);
        console.log(`User ${socket.user.id} joined conversation room: conversation_${conversationId}`);
      } catch (err) {
        socket.emit('error', 'Failed to join conversation room');
      }
    });

    // Client emits typing indicator
    socket.on('typing_start', (conversationId) => {
      socket.to(`conversation_${conversationId}`).emit('agent_typing', { conversationId, isTyping: true });
    });

    socket.on('typing_stop', (conversationId) => {
      socket.to(`conversation_${conversationId}`).emit('agent_typing', { conversationId, isTyping: false });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} ❌`);
    });
  });
};

/**
 * Emits real-time event to a specific room with data payload
 * @param {string} room - Target room name
 * @param {string} event - Socket event key
 * @param {Object} data - Payload content
 */
const emitNotification = (room, event, data) => {
  if (ioInstance) {
    ioInstance.to(room).emit(event, data);
    console.log(`[Socket.io] Emitted ${event} to ${room}`);
  } else {
    console.log('[Socket.io] Cannot emit, instance not initialized yet.');
  }
};

module.exports = { initSocket, emitNotification };
