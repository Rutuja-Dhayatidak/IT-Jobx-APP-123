const express = require("express"); // Finance routes updated 16/05
const cors = require("cors");
const allowedOrigins = require("./config/allowedOrigins");

const app = express();

// Middleware
app.use(express.json());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/super-admin", require("./routes/superAdminRoutes"));
app.use("/api/admin/jobs", require("./routes/adminJobs"));
app.use("/api/jobs", require("./routes/jobs"));
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
app.use("/api/employer/team", require("./routes/employerTeamRoutes"));
app.use("/api/employer", require("./routes/employerRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));
app.use("/api/plans", require("./routes/plansRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/subscription", require("./routes/subscriptionRoutes"));
app.use("/api/sales", require("./routes/salesRoutes"));
app.use("/api/enterprise-leads", require("./routes/enterpriseLeadRoutes"));
app.use("/api/proposal", require("./routes/proposalRoutes"));
app.use("/api/enterprise/contract", require("./routes/contractRoutes"));
app.use("/api/enterprise/payment", require("./routes/enterprisePaymentRoutes"));
app.use("/api/super-admin/activation", require("./routes/superAdminActivationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

app.get("/", (req, res) => {
  res.send("App is running...");
});

module.exports = app;
