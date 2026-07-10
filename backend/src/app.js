const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/super-admin", require("./routes/superAdminRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/finance", require("./routes/financeRoutes"));
app.use("/api/ops", require("./routes/opsRoutes"));
app.use("/api/trust", require("./routes/trustSafetyRoutes"));
app.use("/api/moderator", require("./routes/moderatorRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

const candidateRoutes = require("./routes/candidateRoutes");
app.use("/api/candidates", candidateRoutes);
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

app.get("/", (req, res) => {
  res.send("App is running...");
});

module.exports = app;