const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
// Assume we have Company and SupportTicket models, if not I'll use Candidate with role 'employer'
// For now I'll implement with what's available and some placeholders

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await Candidate.countDocuments({ role: 'candidate' });
    const totalCompanies = await Candidate.countDocuments({ role: 'employer' });
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const pendingApprovals = await Job.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalCompanies,
      activeJobs,
      pendingApprovals,
      userGrowth: [40, 50, 60, 80, 95, 120], // Placeholder
      jobTrends: [20, 35, 45, 30, 55, 70]   // Placeholder
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Candidate.find({ role: 'candidate' }).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Candidate.find({ role: 'employer' }).select('-password').sort('-createdAt');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const company = await Candidate.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.json({ message: "Company approved", company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectCompany = async (req, res) => {
  try {
    const company = await Candidate.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json({ message: "Company rejected", company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().populate('employer', 'firstName lastName email').sort('-createdAt');
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getModerationQueue = async (req, res) => {
  try {
    const pendingJobs = await Job.find({ status: 'pending' }).populate('employer', 'firstName lastName').sort('-createdAt');
    res.json(pendingJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.json({ message: "Job approved", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json({ message: "Job rejected", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSupportTickets = async (req, res) => {
  try {
    // Placeholder for support tickets
    res.json([
      { _id: '1', user: 'John Doe', issue: 'Login problem', status: 'Open', createdAt: new Date() },
      { _id: '2', user: 'Jane Smith', issue: 'Payment failed', status: 'Closed', createdAt: new Date() },
    ]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveTicket = async (req, res) => {
  try {
    res.json({ message: "Ticket resolved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    // Placeholder for activity logs
    res.json([
      { _id: '1', action: 'Approved Job', admin: 'Ops Admin', target: 'Software Engineer', timestamp: new Date() },
      { _id: '2', action: 'Blocked User', admin: 'Ops Admin', target: 'spammer@test.com', timestamp: new Date() },
    ]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
