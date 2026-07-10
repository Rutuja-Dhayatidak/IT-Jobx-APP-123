require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const createSuperAdmin = require("./src/config/createSuperAdmin");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, async () => {
      console.log(`Server running on port ${PORT} 🚀`);

      await createSuperAdmin();
    });

  } catch (error) {
    console.error("❌ Server failed to start:", error);
  }
};

startServer();