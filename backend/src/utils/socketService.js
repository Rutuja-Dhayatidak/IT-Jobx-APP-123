let ioInstance = null;

/**
 * Initializes Socket.io connection listeners and registers the socket instance
 * @param {Object} io - Socket.io Server Instance
 */
const initSocket = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} 🔌`);

    // Let clients register themselves to specific notification rooms (e.g., 'company_XYZ', 'super_admin', 'finance_admin')
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      console.log(`Socket ${socket.id} joined room: ${roomName}`);
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
