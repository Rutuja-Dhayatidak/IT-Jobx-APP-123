const candidateService = require("../services/candidateService");

exports.registerCandidate = async (req, res) => {
  try {
    await candidateService.registerCandidate(req.body);
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(err.message === "Email already exists" ? 400 : 500).json({ message: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { user, token } = await candidateService.verifyOtp(email, otp);
    res.json({
      message: "Registration successful",
      token,
      role: user.role,
      user: { _id: user._id, email: user.email }
    });
  } catch (err) {
    const statusCode = err.message === "User not found" ? 404 : 400;
    res.status(statusCode).json({ message: err.message });
  }
};

exports.loginCandidate = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await candidateService.loginCandidate(email, password);
    res.json({
      message: "Login successful",
      token,
      user: { _id: user._id, email: user.email }
    });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await candidateService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new password are required" });
    }
    const result = await candidateService.changePassword(req.user.id, currentPassword, newPassword);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
