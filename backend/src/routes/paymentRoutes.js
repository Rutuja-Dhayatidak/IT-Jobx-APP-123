const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const verifyToken = require('../middleware/verifyToken');
const employerOnly = require('../middleware/employerOnly');
const Plan = require('../models/Plan');
const Company = require('../models/Company');
const Payment = require('../models/Payment');

// Require login and employer role for payment
router.use(verifyToken, employerOnly);

// 1. Create Razorpay Order
router.post('/create-order', async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ success: false, message: 'Plan ID is required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const subtotal = plan.price;
    const gst = Math.round((subtotal * 0.18) * 100) / 100;
    const totalAmount = subtotal + gst;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: Math.round(totalAmount * 100), // amount in paisa
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
      subtotal,
      gst,
      totalAmount,
      planName: plan.plan_name,
      planType: plan.plan_type
    });
  } catch (error) {
    console.error("Payment Order Creation Error Details:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Verify Razorpay Payment Signature and Subscribe Company
router.post('/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
      return res.status(400).json({ success: false, message: 'Missing required payment verification details' });
    }

    // Verify razorpay signature securely
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Log failed transaction for audit
      const plan = await Plan.findById(planId);
      const Candidate = require('../models/Candidate');
      const user = await Candidate.findById(req.user.id);
      let company = null;
      if (user && user.company_id) {
        company = await Company.findById(user.company_id);
      }
      if (!company) {
        company = await Company.findOne({ owner_user_id: req.user.id });
      }

      const failedPayment = new Payment({
        employerId: req.user.id,
        companyId: company ? company._id : null,
        plan: planId,
        amount: plan ? (plan.price + Math.round(plan.price * 0.18)) : 0,
        status: 'failed',
        transactionStatus: 'failed',
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        failureReason: 'Invalid cryptographic signature. Potential transaction tampering.',
        attempts: 1
      });
      await failedPayment.save();

      // Send socket alert to admin room
      const { emitNotification } = require('../utils/socketService');
      emitNotification('finance_admin', 'new_payment_failed', {
        companyName: company ? company.name : 'Unknown Employer',
        reason: 'Signature mismatch'
      });

      return res.status(400).json({ success: false, message: 'Invalid payment signature. Transaction tampering blocked.' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const Candidate = require('../models/Candidate');
    const user = await Candidate.findById(req.user.id);
    let company = null;
    if (user && user.company_id) {
      company = await Company.findById(user.company_id);
    }
    if (!company) {
      company = await Company.findOne({ owner_user_id: req.user.id });
    }
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    // Determine validity days
    let validityDays = 30; // Standard month
    if (plan.plan_name.toLowerCase().includes('year') || plan.billing_cycle === 'yearly') {
      validityDays = 365;
    } else if (plan.plan_name.toLowerCase().includes('trial') || plan.plan_type === 'free') {
      validityDays = 14;
    } else if (plan.plan_type === 'enterprise') {
      validityDays = 365;
    }

    const planStartedAt = new Date();
    const planExpiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    // Calculate financials
    const subtotal = plan.price;
    const gstAmount = Math.round((subtotal * 0.18) * 100) / 100;
    const totalAmount = subtotal + gstAmount;

    // Generate Unique legal Serial Number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    // 1. Create completed Payment log
    const payment = new Payment({
      employerId: req.user.id,
      companyId: company._id,
      plan: plan._id,
      amount: totalAmount,
      subtotal,
      gstAmount,
      status: 'completed',
      transactionStatus: 'completed',
      paymentMethod: 'razorpay',
      transactionId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      invoiceUrl: `/api/payments/invoices/download/${invoiceNumber}`
    });
    await payment.save();

    // 2. Create legal GST Invoice document
    const Invoice = require('../models/Invoice');
    const invoice = new Invoice({
      invoiceNumber,
      invoice_number: invoiceNumber,
      company_id: company._id,
      payment_id: payment._id,
      base_amount: subtotal,
      cgst: Math.round((gstAmount / 2) * 100) / 100,
      sgst: Math.round((gstAmount / 2) * 100) / 100,
      total_amount: totalAmount,
      pdf_url: `/api/payments/invoices/download/${invoiceNumber}`,
      invoice_date: planStartedAt,
      status: 'paid',
      service_description: `ITjobx ${plan.plan_name} Subscription Plan`
    });
    await invoice.save();

    // 3. Create/Update Subscription document
    const Subscription = require('../models/Subscription');
    let subscription = await Subscription.findOne({ companyId: company._id });

    // Extract permissions based on plan parameters
    const permissions = ['post_job', 'add_team_member'];
    if (plan.plan_type !== 'free') permissions.push('download_resume');
    if (plan.plan_type === 'pro' || plan.plan_type === 'enterprise') {
      permissions.push('advanced_analytics', 'ai_matching');
    }

    // Dynamic seat and job limit calculation
    let seatLimit = 1;
    let jobLimit = 2;
    if (plan.plan_type === 'basic') {
      seatLimit = plan.limits?.team_members !== -1 ? (plan.limits?.team_members ?? 3) : 3;
      jobLimit = plan.limits?.job_posts !== -1 ? (plan.limits?.job_posts ?? 5) : 5;
    } else if (plan.plan_type === 'pro') {
      seatLimit = plan.limits?.team_members !== -1 ? (plan.limits?.team_members ?? 10) : 10;
      jobLimit = plan.limits?.job_posts !== -1 ? (plan.limits?.job_posts ?? 25) : 25;
    } else if (plan.plan_type === 'enterprise') {
      seatLimit = plan.limits?.team_members !== -1 ? (plan.limits?.team_members ?? 9999) : 9999;
      jobLimit = plan.limits?.job_posts !== -1 ? (plan.limits?.job_posts ?? 9999) : 9999;
    }

    if (!subscription) {
      subscription = new Subscription({
        companyId: company._id,
        planId: plan._id,
        plan: plan.plan_type,
        seatLimit,
        jobLimit,
        status: 'active',
        startDate: planStartedAt,
        expiryDate: planExpiresAt,
        autoRenew: true,
        permissions,
        invoiceId: invoice._id
      });
    } else {
      subscription.planId = plan._id;
      subscription.plan = plan.plan_type;
      subscription.seatLimit = seatLimit;
      subscription.jobLimit = jobLimit;
      subscription.status = 'active';
      subscription.startDate = planStartedAt;
      subscription.expiryDate = planExpiresAt;
      subscription.permissions = permissions;
      subscription.invoiceId = invoice._id;
    }
    await subscription.save();

    // Update Company reference properties directly
    company.plan_id = plan._id;
    company.plan_type = plan.plan_type;
    company.plan_started_at = planStartedAt;
    company.plan_expires_at = planExpiresAt;
    company.plan_status = 'active';
    await company.save();

    // 4. Generate highly styled Invoice PDF on local storage
    const { generateInvoicePDF } = require('../utils/invoiceGenerator');
    let absolutePdfPath = '';
    try {
      absolutePdfPath = await generateInvoicePDF({
        invoiceNumber,
        companyName: company.name,
        gstin: company.gst_number || 'N/A',
        billingAddress: company.company_location || 'Corporate Hub',
        billingEmail: company.official_work_email || company.email,
        planName: plan.plan_name,
        subtotal,
        gstAmount,
        totalAmount,
        transactionId: razorpay_payment_id,
        paymentMethod: 'Razorpay checkout',
        issuedDate: planStartedAt,
        expiryDate: planExpiresAt
      });
    } catch (pdfErr) {
      console.error("PDF Compilation Failed:", pdfErr);
    }

    // 5. Send Professional Checkout Email Notification with Attachment
    const sendEmail = require('../utils/sendEmail');
    try {
      const jobPostsLimit = plan.limits?.job_posts === -1 ? 'Unlimited' : plan.limits?.job_posts;
      const teamMembersLimit = plan.limits?.team_members === -1 ? 'Unlimited' : plan.limits?.team_members;

      const emailHtml = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="display: inline-block; width: 56px; height: 56px; background-color: #ecfdf5; border-radius: 50%; text-align: center; line-height: 56px; font-size: 28px; margin-bottom: 16px;">
              🚀
            </div>
            <h2 style="color: #0f172a; margin: 0; font-weight: 800; font-size: 24px; tracking: -0.025em;">Subscription Upgraded Successfully!</h2>
            <p style="color: #64748b; font-size: 14px; margin: 4px 0 0 0;">ITjobx B2B Premium Account Active</p>
          </div>

          <p style="font-size: 15px; color: #334155;">Dear <strong>${company.contact_person_name || 'Partner'}</strong>,</p>
          <p style="font-size: 15px; color: #334155; margin-bottom: 24px;">
            Thank you for upgrading your company account. Your subscription to the premium <strong>ITjobx ${plan.plan_name} Plan</strong> is now active. 
            All corporate limits and dashboard privileges have been upgraded accordingly.
          </p>

          <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">
            Subscription Summary & Plan Details
          </h3>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: bold; color: #475569; width: 40%;">Subscription Plan</td>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: 700; color: #0f172a;">${plan.plan_name}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Total Amount Paid</td>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: 700; color: #10b981;">INR ${totalAmount.toLocaleString()}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Invoice Serial No</td>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-family: monospace; font-size: 13px; color: #0f172a; font-weight: bold;">${invoiceNumber}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Expiry Date</td>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: 700; color: #e11d48;">${planExpiresAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
            </tr>
            <tr style="background-color: #f8fafc;">
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Job Posting Limit</td>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: 700; color: #0f172a;">${jobPostsLimit} Jobs</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: bold; color: #475569;">Team Seats Allocated</td>
              <td style="padding: 12px; border: 1px solid #f1f5f9; font-weight: 700; color: #0f172a;">${teamMembersLimit} Seats</td>
            </tr>
          </table>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #15803d; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              📄 PDF Invoice Attached
            </p>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #166534; line-height: 1.4;">
              For your compliance and accounting audits, we have attached the formal, digitally-compiled GST tax invoice to this email.
            </p>
          </div>

          <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0;">
            If you have any questions about billing or require assistance allocating your team seats, please feel free to reach out to our dedicated finance desk.
          </p>

          <p style="font-size: 14px; color: #64748b; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Best regards,<br/>
            <strong>ITjobx Finance & Compliance Desk</strong>
          </p>
        </div>
      `;

      const attachments = [];
      if (absolutePdfPath) {
        attachments.push({
          filename: `${invoiceNumber}.pdf`,
          path: absolutePdfPath
        });
      }

      await sendEmail(
        company.official_work_email || company.email,
        `ITjobx GST Invoice - ${invoiceNumber}`,
        `Your upgrade to ${plan.plan_name} is complete! Invoice attached.`,
        emailHtml,
        attachments
      );
    } catch (emailErr) {
      console.error("Invoice Dispatch Email Failed:", emailErr);
    }

    // 6. Broadcast socket real-time alerts to rooms
    const { emitNotification } = require('../utils/socketService');
    emitNotification('super_admin', 'new_subscription_purchased', {
      companyName: company.name,
      planName: plan.plan_name,
      amount: totalAmount
    });
    emitNotification('finance_admin', 'new_payment_completed', {
      invoiceNumber,
      companyName: company.name,
      amount: totalAmount
    });
    emitNotification(`company_${company._id}`, 'subscription_updated', {
      planName: plan.plan_name,
      status: 'active',
      expiresAt: planExpiresAt
    });

    const updatedCompany = await Company.findById(company._id).populate('plan_id');

    // Generate refreshed JWT token
    const generateToken = require('../utils/generateToken');
    const refreshedToken = generateToken(user);

    res.json({
      success: true,
      message: `Successfully verified signature and subscribed to ${plan.plan_name}!`,
      token: refreshedToken,
      company: updatedCompany,
      payment,
      subscription
    });
  } catch (error) {
    console.error("Payment Signature Verification Error Details:", error);
    res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
});

// 3. SECURE authenticated route to download static PDF Invoice
router.get('/invoices/download/:invoiceNumber', async (req, res) => {
  try {
    const { invoiceNumber } = req.params;

    // Verify client company permission matches the requested invoice
    const company = await Company.findOne({ owner_user_id: req.user.id });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    const Invoice = require('../models/Invoice');
    const invoice = await Invoice.findOne({ invoiceNumber, companyId: company._id });
    if (!invoice) {
      return res.status(403).json({ success: false, message: 'Access denied or invoice not found.' });
    }

    const path = require('path');
    const fs = require('fs');
    const pdfPath = path.join(__dirname, '..', '..', 'uploads', 'invoices', `${invoiceNumber}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ success: false, message: 'Physical invoice PDF file not compiled on disk.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoiceNumber}.pdf"`);

    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Secure Invoice Download Failed:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
