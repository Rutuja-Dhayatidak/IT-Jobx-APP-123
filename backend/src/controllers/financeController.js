const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const Pricing = require('../models/Pricing');
const Candidate = require('../models/Candidate');

// 📊 Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const activeSubscriptions = await Payment.countDocuments({ status: 'completed' });
    const pendingRefunds = await Refund.countDocuments({ status: 'pending' });

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      activeSubscriptions,
      pendingRefunds,
      revenueGrowth: 15.2,
      subscriptionGrowth: 8.4
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📈 Revenue Analytics
exports.getRevenue = async (req, res) => {
  try {
    const { timeframe } = req.query; // Daily, Weekly, Monthly
    // Simple aggregation for demonstration
    const revenueTrend = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { 
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
        revenue: { $sum: "$amount" } 
      }},
      { $sort: { "_id": 1 } },
      { $limit: 30 }
    ]);
    res.json(revenueTrend);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 💳 Subscription Plans
exports.getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort('-createdAt');
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPlan = async (req, res) => {
  try {
    const plan = await Plan.create(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📦 Employer Payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('employerId', 'firstName lastName email')
      .populate('plan', 'name')
      .sort('-createdAt');
    
    const formattedPayments = payments.map(p => ({
      _id: p._id,
      employer: `${p.employerId?.firstName} ${p.employerId?.lastName}`,
      plan: p.plan?.name || 'N/A',
      amount: p.amount,
      status: p.status,
      date: p.date,
      method: p.paymentMethod || 'Razorpay'
    }));

    res.json(formattedPayments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📊 Pricing & Charges
exports.getPricing = async (req, res) => {
  try {
    let pricing = await Pricing.findOne().sort('-createdAt');
    if (!pricing) {
      pricing = await Pricing.create({});
    }
    res.json(pricing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePricing = async (req, res) => {
  try {
    const pricing = await Pricing.findOneAndUpdate({}, req.body, { upsert: true, new: true });
    res.json(pricing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔄 Refunds
exports.getRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate('employerId', 'firstName lastName')
      .sort('-createdAt');
    
    const formattedRefunds = refunds.map(r => ({
      _id: r._id,
      employer: `${r.employerId?.firstName} ${r.employerId?.lastName}`,
      amount: r.amount,
      reason: r.reason,
      status: r.status,
      date: r.createdAt
    }));

    res.json(formattedRefunds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveRefund = async (req, res) => {
  try {
    const { id } = req.body;
    const refund = await Refund.findById(id);
    if (!refund) return res.status(404).json({ message: "Refund request not found" });

    refund.status = 'approved';
    refund.processedBy = req.user._id;
    refund.processedAt = new Date();
    await refund.save();

    res.json({ message: "Refund approved successfully", refund });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectRefund = async (req, res) => {
  try {
    const { id, reason } = req.body;
    const refund = await Refund.findById(id);
    if (!refund) return res.status(404).json({ message: "Refund request not found" });

    refund.status = 'rejected';
    refund.rejectionReason = reason;
    refund.processedBy = req.user._id;
    refund.processedAt = new Date();
    await refund.save();

    res.json({ message: "Refund rejected successfully", refund });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 Invoices
exports.getInvoices = async (req, res) => {
  try {
    // Invoices are derived from payments
    const payments = await Payment.find({ status: 'completed' })
      .populate('employerId', 'firstName lastName email')
      .sort('-createdAt');
    
    const invoices = payments.map(p => ({
      id: `INV-${p._id.toString().substr(-6).toUpperCase()}`,
      employer: `${p.employerId?.firstName} ${p.employerId?.lastName}`,
      amount: p.amount,
      gst: Math.round(p.amount * 0.18),
      total: Math.round(p.amount * 1.18),
      date: p.date,
      status: 'Paid'
    }));
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📊 Reports
exports.getReports = async (req, res) => {
  try {
    const reportSummary = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { 
        _id: { $month: "$date" }, 
        revenue: { $sum: "$amount" },
        count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);
    res.json(reportSummary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
