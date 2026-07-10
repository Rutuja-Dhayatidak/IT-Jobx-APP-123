const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper to log actions
const logAction = async (moderatorId, actionType, targetId, targetType, details) => {
  try {
    await new ActivityLog({ moderatorId, actionType, targetId, targetType, details }).save();
  } catch (err) {
    console.error("Log failed:", err);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Candidate.findOne({ email });
    
    if (!user || !['moderator', 'trust_safety', 'superAdmin'].includes(user.role)) {
      return res.status(401).json({ message: "Invalid credentials or unauthorized role" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, permissions: user.permissions || [] },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, permissions: user.permissions || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [total, pending, resolved] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: 'Pending' }),
      Report.countDocuments({ status: 'Resolved' })
    ]);
    const activeMods = await Candidate.countDocuments({ role: 'moderator' });
    res.json({ total, pending, resolved, activeMods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find().sort('-createdAt');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reviewReport = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const report = await Report.findByIdAndUpdate(req.params.id, { status, adminNotes: notes }, { new: true });
    
    await logAction(req.user.id, 'REVIEW_REPORT', report._id, 'report', `Status changed to ${status}`);
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Candidate.find({ role: 'candidate' }).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const user = await Candidate.findByIdAndUpdate(req.params.id, { isBlocked: true, status: 'blocked' }, { new: true });
    await logAction(req.user.id, 'BAN_USER', user._id, 'user', "User banned for violation");
    res.json({ message: "User banned" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const user = await Candidate.findByIdAndUpdate(req.params.id, { isBlocked: false, status: 'active' }, { new: true });
    await logAction(req.user.id, 'UNBAN_USER', user._id, 'user', "User ban lifted");
    res.json({ message: "User access restored" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.warnUser = async (req, res) => {
  try {
    const { reason } = req.body;
    await logAction(req.user.id, 'WARN_USER', req.params.id, 'user', reason);
    res.json({ message: "Warning issued" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort('-createdAt');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    await logAction(req.user.id, 'APPROVE_JOB', job._id, 'job', "Job approved for listing");
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    await logAction(req.user.id, 'REJECT_JOB', job._id, 'job', "Job rejected from platform");
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find().populate('moderatorId', 'firstName lastName').sort('-timestamp');
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
