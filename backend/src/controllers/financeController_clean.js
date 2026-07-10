const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const Refund = require('../models/Refund');
const Pricing = require('../models/Pricing');
const Candidate = require('../models/Candidate');
const Invoice = require('../models/Invoice');
const Lead = require('../models/Lead');
const AuditLog = require('../models/AuditLog');
const EnterpriseRevenue = require('../models/EnterpriseRevenue');
const PaymentVerification = require('../models/PaymentVerification');
const crypto = require('crypto');

// ?? Dashboard Stats (RazorpayX Style)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // MRR/ARR Mock Calculation (based on monthly active subscriptions)
    const mrr = (totalRevenue[0]?.total || 0) * 0.15; // Simulated 15% recurring
    const arr = mrr * 12;

    const pendingVerifications = await Lead.countDocuments({ 
        status: 'contract_signed',
        payment_status: { $in: ['pending', 'link_sent'] }
    });

    const failedTransactions = await Payment.countDocuments({ status: 'failed' });
    const refundRequests = await Refund.countDocuments({ status: 'pending' });

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      mrr,
      arr,
      pendingVerifications,
      failedTransactions,
      refundRequests,
      revenueGrowth: 18.5,
      successRate: 94.2
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ?? Revenue Growth Analytics
exports.getRevenueGrowth = async (req, res) => {
    try {
        const analytics = await EnterpriseRevenue.find().sort('-year -month').limit(12);
        res.json(analytics.reverse());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ?? Subscription Plans
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

// ?? Employer Payments (Unified Ledger)
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('employerId', 'firstName lastName email')
      .populate('companyId', 'name')
      .populate('plan', 'plan_name')
      .sort('-createdAt');
    
    const formattedPayments = payments.map(p => ({
      _id: p._id,
      company: p.companyId?.name || (p.employerId ? `${p.employerId.firstName} ${p.employerId.lastName}` : 'N/A'),
      plan: p.plan?.plan_name || 'Enterprise',
      amount: p.amount,
      gst: p.gstAmount || (p.amount * 0.18),
      status: p.status,
      date: p.date || p.createdAt,
      method: p.paymentMethod || 'Razorpay',
      razorpayId: p.razorpayPaymentId || p.transactionId
    }));

    res.json(formattedPayments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ? Verify Razorpay Payment (Finance Approval Step)
exports.verifyRazorpayPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, status } = req.body; // status: 'verified' or 'rejected'

        const payment = await Payment.findById(id);
        if (!payment) return res.status(404).json({ message: "Payment record not found" });

        // Update verification step
        const verification = await PaymentVerification.findOneAndUpdate(
            { paymentId: id },
            { 
                $set: { 
                    'steps.financeApproval': {
                        status: status === 'verified' ? 'approved' : 'rejected',
                        approvedBy: req.user._id,
                        approvedAt: new Date(),
                        notes
                    },
                    finalStatus: status === 'verified' ? 'verified' : 'rejected'
                }
            },
            { upsert: true, new: true }
        );

        // If verified, update lead status for activation handoff
        if (status === 'verified') {
            await Lead.findOneAndUpdate(
                { payment_id: payment.razorpayPaymentId || payment.transactionId },
                { status: 'payment_received', payment_status: 'paid' }
            );
        }

        // Audit Log
        await AuditLog.create({
            adminId: req.user._id,
            adminName: req.user.name || 'Finance Admin',
            module: 'FINANCE_PAYMENTS',
            action: 'VERIFY_RAZORPAY',
            displayMessage: `${status === 'verified' ? 'Approved' : 'Rejected'} payment verification for Ref: ${payment.transactionId}`,
            targetId: id,
            severity: status === 'verified' ? 'medium' : 'high',
            traceId: crypto.randomBytes(8).toString('hex')
        });

        res.json({ success: true, verification });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ?? Pending Activations (Finance-Ready Leads)
exports.getPendingActivations = async (req, res) => {
    try {
        const leads = await Lead.find({ 
            status: 'payment_received',
            payment_status: 'paid'
        }).sort('-updatedAt');

        res.json(leads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ?? Pricing & Charges
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

// ??? Audit Logs
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find({ module: { $in: ['FINANCE', 'FINANCE_PAYMENTS', 'ENTERPRISE_FINANCE'] } })
            .sort('-createdAt')
            .limit(100);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ?? All Transactions (History)
exports.getTransactions = async (req, res) => {
    try {
        const { status, company, startDate, endDate } = req.query;
        let query = {};
        if (status) query.status = status;
        if (startDate && endDate) query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };

        const txs = await Payment.find(query)
            .populate('companyId', 'name')
            .sort('-createdAt');
        res.json(txs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ?? Refunds
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

// ?? Invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('companyId', 'name')
      .sort('-createdAt');
    
    const formattedInvoices = invoices.map(i => ({
      id: i.invoiceNumber,
      employer: i.companyId?.name || 'N/A',
      amount: i.subtotal,
      gst: i.gstAmount,
      total: i.totalAmount,
      date: i.issuedDate,
      status: 'Paid'
    }));
    res.json(formattedInvoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ?? Reports Summary
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

// ?? Download Dynamic PDF Invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;
    
    const invoice = await Invoice.findOne({ invoiceNumber })
      .populate('companyId')
      .populate('planId')
      .populate('paymentId');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice registry record not found' });
    }

    const path = require('path');
    const fs = require('fs');
    const { generateInvoicePDF } = require('../utils/invoiceGenerator');

    try {
      const pdfData = {
        invoiceNumber: invoice.invoiceNumber,
        companyName: invoice.companyId?.name || 'Corporate Registry',
        gstin: invoice.companyId?.gst_number || 'Not Provided',
        billingAddress: invoice.companyId?.company_location || 'Not Provided',
        billingEmail: invoice.companyId?.email || '',
        planName: invoice.planId?.plan_name || 'Basic Subscription',
        subtotal: invoice.subtotal || 0,
        gstAmount: invoice.gstAmount || 0,
        totalAmount: invoice.totalAmount || 0,
        transactionId: invoice.paymentId?.transactionId || 'N/A',
        paymentMethod: invoice.paymentId?.paymentMethod || 'Razorpay',
        issuedDate: invoice.issuedDate || invoice.createdAt,
        expiryDate: invoice.expiryDate
      };
      
      const generatedPath = await generateInvoicePDF(pdfData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceNumber}.pdf"`);
      return fs.createReadStream(generatedPath).pipe(res);
    } catch (genErr) {
      console.error("Dynamic PDF compilation failed:", genErr);
      return res.status(500).json({ success: false, message: 'Invoice PDF compiler failed.' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
