require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const createSuperAdmin = require("./src/config/createSuperAdmin");
const allowedOrigins = require("./src/config/allowedOrigins");
const { initSocket } = require("./src/utils/socketService");
const { startSubscriptionCron } = require("./src/cron/subscriptionCron");

const PORT = process.env.PORT || 5000;

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
      console.log(`Server running on port ${PORT} 🚀 (with WebSockets active)`);

      await createSuperAdmin();
      startSubscriptionCron(); // Start background billing automated sweeps
      require("./src/cron/proposalCron"); // Start proposal follow-up automations
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

startServer();
