// Initialize environment validation at the absolute top of the server startup lifecycle
const env = require("./src/config/env.config");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const createSuperAdmin = require("./src/config/createSuperAdmin");
const allowedOrigins = require("./src/config/allowedOrigins");
const { initSocket } = require("./src/utils/socketService");
const { startSubscriptionCron } = require("./src/cron/subscriptionCron");
const logger = require("./src/utils/logger");

const PORT = env.PORT;

// Create standard HTTP server wrapping Express app
const server = http.createServer(app);

// Instantiate Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

// Initialize Socket event handlers
initSocket(io);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, async () => {
      logger.info(`Server running on port ${PORT} 🚀 (with WebSockets active)`);

      await createSuperAdmin();
      startSubscriptionCron(); // Start background billing automated sweeps
      require("./src/cron/proposalCron"); // Start proposal follow-up automations
    });

  } catch (error) {
    logger.error("❌ Server failed to start:", error);
  }
};

startServer();
// Trigger restart for environment changes

