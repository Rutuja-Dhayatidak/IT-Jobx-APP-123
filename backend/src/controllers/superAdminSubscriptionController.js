const Subscription = require('../models/Subscription');
const Company = require('../models/Company');
const Plan = require('../models/Plan');
const Invoice = require('../models/Invoice');
const Refund = require('../models/Refund');
const Payment = require('../models/Payment');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const CompanyTeamMember = require('../models/CompanyTeamMember');

// 📊 1. Get All Subscriptions with aggregate telemetry
exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate({
        path: 'companyId',
        select: 'name email owner_user_id plan_type plan_status logo isVerified'
      })
      .populate('planId')
      .lean();

    // Map to the standardized interface expected by the table
    const mapped = subscriptions.map(sub => {
      const company = sub.companyId || {};
      const plan = sub.planId || {};
      
      return {
        _id: sub._id,
        companyId: company._id || null,
        companyName: company.name || 'Corporate Registry',
        companyEmail: company.email || 'corporate@client.com',
        planName: plan.plan_name || sub.planType || 'Free Tier',
        amount: plan.price || 0,
        billingCycle: plan.billing_cycle || 'Monthly',
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
        subscriptionStatus: sub.status || 'inactive',
        paymentStatus: sub.status === 'active' ? 'completed' : 'pending',
        usersLimit: plan.limits?.team_members || 5,
        activeUsers: sub.usage?.membersAdded || 0,
        invoiceId: sub.invoiceId || null
      };
    });

    res.json(mapped);
  } catch (err) {
    console.error("Get Super-Admin Subscriptions error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔍 2. Get Subscription Details & related sub-records
exports.getSubscriptionById = async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id)
      .populate('companyId')
      .populate('planId')
      .lean();

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription details not found' });
    }

    const company = sub.companyId || {};

    // Get live usage totals
    const activeJobsCount = await Job.countDocuments({ company: company._id });
    const teamCount = await CompanyTeamMember.countDocuments({ company_id: company._id });

    // Fetch invoice lists
    const invoices = await Invoice.find({ companyId: company._id })
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .lean();

    // Fetch refund requests/history
    const paymentIds = invoices.map(i => i.paymentId?._id).filter(Boolean);
    const refunds = await Refund.find({ payment: { $in: paymentIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Mock Login History / Users count details for robust display
    const userList = await Candidate.find({ _id: company.owner_user_id }).select('firstName lastName email status lastLoginAt').lean();

    res.json({
      success: true,
      subscription: {
        _id: sub._id,
        startDate: sub.startDate,
        expiryDate: sub.expiryDate,
        status: sub.status,
        autoRenew: sub.autoRenew,
        plan: sub.planId ? {
          name: sub.planId.plan_name,
          price: sub.planId.price,
          billingCycle: sub.planId.billing_cycle
        } : { name: sub.planType || 'Free', price: 0, billingCycle: 'Monthly' }
      },
      company: {
        _id: company._id,
        name: company.name || 'Company Name',
        email: company.email || 'company@mail.com',
        logo: company.logo,
        isVerified: company.isVerified,
        phone: company.mobile_number,
        address: company.company_location,
        gstin: company.gst_number
      },
      usage: {
        jobsPosted: activeJobsCount,
        membersAdded: teamCount + 1, // including owner
        resumesDownloaded: sub.usage?.resumesDownloaded || 0,
        jobsLimit: sub.planId?.limits?.job_posts || 5,
        membersLimit: sub.planId?.limits?.team_members || 5
      },
      invoices,
      refunds,
      users: userList,
      activeUsersCount: teamCount + 1 // including owner
    });
  } catch (err) {
    console.error("Get Subscription Details error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📝 3. Update subscription parameters
exports.updateSubscription = async (req, res) => {
  try {
    const { status, autoRenew } = req.body;
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    if (status) sub.status = status;
    if (autoRenew !== undefined) sub.autoRenew = autoRenew;

    await sub.save();
    res.json({ success: true, message: "Subscription parameters updated successfully", subscription: sub });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ⚙️ 4. Override Subscription (manual adjustment of expiry, plan tier, status)
exports.overrideSubscription = async (req, res) => {
  try {
    const { planId, expiryDate, status, billingCycle, usersLimit } = req.body;
    
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription target not found' });

    // Validate and load Plan if changing
    let selectedPlan = null;
    if (planId) {
      selectedPlan = await Plan.findById(planId);
      if (!selectedPlan) return res.status(404).json({ success: false, message: 'Target Plan not found in system catalogs' });
      sub.planId = selectedPlan._id;
      sub.planType = selectedPlan.name.toLowerCase();
    }

    if (expiryDate) sub.expiryDate = new Date(expiryDate);
    if (status) sub.status = status;

    await sub.save();

    // Critical: Sync Company profile model so active middlewares/gates match!
    const company = await Company.findById(sub.companyId);
    if (company) {
      if (selectedPlan) {
        company.plan_id = selectedPlan._id;
        company.plan_type = selectedPlan.name.toLowerCase();
      }
      if (expiryDate) company.plan_expires_at = new Date(expiryDate);
      if (status) company.plan_status = status;
      await company.save();
    }

    res.json({
      success: true,
      message: "Subscription status overridden and synchronized successfully across employer profiles! ⚙️",
      subscription: sub
    });
  } catch (err) {
    console.error("Override error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 💸 5. Process refunds (approve or decline adjustment claim)
exports.refundSubscription = async (req, res) => {
  try {
    const { refundAmount, refundReason, refundStatus } = req.body;
    
    // Find subscription
    const sub = await Subscription.findById(req.params.id).populate('companyId');
    if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });

    // Locate related completed payment to reverse
    const lastPayment = await Payment.findOne({ 
      companyId: sub.companyId?._id, 
      status: 'completed' 
    }).sort({ createdAt: -1 });

    if (!lastPayment) {
      return res.status(404).json({ success: false, message: 'No completed gateway charges found to reverse' });
    }

    // Process refund status
    const refund = new Refund({
      payment: lastPayment._id,
      employerId: sub.companyId?.owner_user_id || req.user._id,
      amount: refundAmount || lastPayment.amount,
      reason: refundReason || 'Manual administrative refund trigger',
      status: refundStatus || 'approved',
      processedBy: req.user._id,
      processedAt: new Date()
    });

    await refund.save();

    // Mark payment status as refunded/partially-refunded
    lastPayment.status = 'refunded';
    await lastPayment.save();

    // Update subscription status to inactive/expired upon refunding
    sub.status = 'inactive';
    await sub.save();

    // Update company plan status
    await Company.findByIdAndUpdate(sub.companyId?._id, { plan_status: 'inactive' });

    res.json({
      success: true,
      message: `Adjustment processed. Reversed amount of ₹${refund.amount.toLocaleString()} successfully!`,
      refund
    });
  } catch (err) {
    console.error("Refund processing error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🧾 6. Get All system refund history logs
exports.getRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate('payment')
      .populate({
        path: 'employerId',
        select: 'firstName lastName email'
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json(refunds);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📄 7. Serve invoice details & Stream compiled PDFs
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('companyId')
      .populate('paymentId')
      .lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice registry record not found' });
    }

    // Stream the compiled PDF file from disk if download flag is true
    if (req.query.download === 'true') {
      const path = require('path');
      const fs = require('fs');

      // Dynamically compile the GST tax invoice PDF right now using the latest premium generator layout!
      try {
        const { generateInvoicePDF } = require('../utils/invoiceGenerator');
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
    }

    res.json({
      success: true,
      invoice
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
