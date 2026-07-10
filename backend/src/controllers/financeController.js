const Lead = require('../models/Lead');
const Invoice = require('../models/Invoice');
const Notification = require('../models/Notification');
const Candidate = require('../models/Candidate');
const sendEmail = require('../utils/sendEmail');
const generateInvoicePDF = require('../utils/generateInvoicePDF');
const mongoose = require('mongoose');

// 📊 Dashboard Stats
exports.getFinanceStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.setHours(0, 0, 0, 0));

        const stats = await Lead.aggregate([
            {
                $facet: {
                    total_collected: [
                        { $match: { payment_status: "paid" } },
                        { $group: { _id: null, total: { $sum: { $ifNull: ["$total_paid", "$value"] } } } }
                    ],
                    pending_count: [
                        { $match: { status: "payment_received", payment_verified_at: { $exists: false } } },
                        { $count: "count" }
                    ],
                    verified_today: [
                        { $match: { payment_verified_at: { $gte: startOfToday } } },
                        { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: { $ifNull: ["$total_paid", "$value"] } } } }
                    ],
                    invoices_sent_month: [
                        { $match: { invoice_sent_at: { $gte: startOfMonth } } },
                        { $count: "count" }
                    ]
                }
            }
        ]);

        const recent_payments = await Lead.find({
            status: { $in: ["payment_received", "activated"] }
        })
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('companyName total_paid value status payment_status updatedAt');

        // Mocking monthly revenue for chart as per requirement
        const monthly_revenue = [
            { month: 'Feb', amount: 450000 },
            { month: 'Mar', amount: 780000 },
            { month: 'Apr', amount: 1200000 },
            { month: 'May', amount: 2450000 }
        ];

        res.json({
            total_collected: stats[0].total_collected[0]?.total || 0,
            pending_count: stats[0].pending_count[0]?.count || 0,
            verified_today: stats[0].verified_today[0]?.count || 0,
            verified_today_amount: stats[0].verified_today[0]?.amount || 0,
            invoices_sent_month: stats[0].invoices_sent_month[0]?.count || 0,
            recent_payments,
            monthly_revenue
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 💳 Payments Management
exports.getPendingPayments = async (req, res) => {
    try {
        const payments = await Lead.find({
            status: "payment_received",
            payment_verified_at: { $exists: false }
        }).sort({ updatedAt: 1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getVerifiedPayments = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {
            $or: [
                { payment_status: "paid" },
                { status: "activated" },
                { payment_verified_at: { $exists: true } }
            ]
        };

        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { transaction_id: { $regex: search, $options: 'i' } }
            ];
        }

        const payments = await Lead.find(query)
            .populate('payment_verified_by', 'firstName lastName')
            .sort({ payment_verified_at: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getRejectedPayments = async (req, res) => {
    try {
        const payments = await Lead.find({ status: "rejected" }).sort({ updatedAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ✅ Verify Payment Flow
exports.verifyPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { txn_id, verified_notes } = req.body;

        const lead = await Lead.findById(id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });

        lead.payment_verified_at = new Date();
        lead.payment_verified_by = req.user.userId || req.user._id;
        lead.verification_notes = verified_notes;
        lead.payment_id = txn_id || lead.payment_id;
        // Keep status as payment_received but mark as verified internally so Super Admin can activate
        await lead.save();

        // [NEW] Create entry in specialized paymentverifications collection for audit/UI
        try {
            const PaymentVerification = require('../models/PaymentVerification');
            await PaymentVerification.create({
                lead_id: lead._id,
                company_name: lead.companyName || lead.company,
                amount: lead.total_paid || lead.value || 0,
                transaction_id: txn_id || lead.payment_id,
                verified_by: req.user.userId || req.user._id,
                verified_at: new Date(),
                notes: verified_notes,
                status: 'verified'
            });
            console.log(`[Finance] Created specialized verification record for ${lead.companyName}`);
        } catch (pvErr) {
            console.error("[Finance] Verification collection entry failed (skipping):", pvErr.message);
        }

        // 1. Email Super Admin
        const superAdmins = await Candidate.find({ role: { $in: ["superAdmin", "SUPER_ADMIN"] } });
        const superAdminEmails = superAdmins.map(admin => admin.email).join(',');

        if (superAdminEmails) {
            await sendEmail(
                superAdminEmails,
                `Payment Verified — Activate ${lead.companyName}`,
                `Payment of ₹${(lead.total_paid || 0).toLocaleString()} verified for ${lead.companyName}. TXN: ${txn_id || 'N/A'}. Please activate their plan.`,
                `<h3>Payment Verified</h3>
                 <p>Company: <b>${lead.companyName}</b></p>
                 <p>Amount: <b>₹${(lead.total_paid || 0).toLocaleString()}</b></p>
                 <p>TXN ID: <b>${txn_id || 'N/A'}</b></p>
                 <a href="http://localhost:5174/super-admin/activation" style="background:#16a34a;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Activate Now</a>`
            );

            // 🔔 Trigger In-App Notifications for all Super Admins
            for (const admin of superAdmins) {
                await Notification.create({
                    recipient: admin._id,
                    title: "Payment Verified! 💰",
                    message: `Payment for ${lead.companyName || lead.company} has been verified by Finance. Please activate the enterprise plan.`,
                    type: "payment_verified",
                    relatedId: lead._id
                });
            }
        }

        // 2. Email Client
        await sendEmail(
            lead.workEmail || lead.email,
            "Payment Confirmed — ITjobx Plan Activating",
            `We have received and verified your payment of ₹${(lead.total_paid || 0).toLocaleString()}. Our team is now activating your enterprise account.`,
            `<h3>Payment Received</h3>
             <p>Hello ${lead.hrName || lead.name},</p>
             <p>Your payment for the ITjobx Enterprise Plan has been verified successfully.</p>
             <p>Our Super Admin has been notified, and your account features will be unlocked shortly.</p>`
        );

        res.json({ success: true, message: "Payment verified and notifications sent" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ❌ Reject Payment Flow
exports.rejectPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, notes } = req.body;

        const lead = await Lead.findById(id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });

        lead.status = "rejected";
        lead.payment_status = "failed";
        lead.rejection_reason = reason;
        lead.rejection_notes = notes;
        await lead.save();

        // Email Company
        await sendEmail(
            lead.workEmail || lead.email,
            `Payment Issue — ${reason}`,
            `There was an issue with your payment verification. Reason: ${reason}. ${notes}`,
            `<h3>Payment Verification Failed</h3>
             <p>Dear ${lead.hrName || lead.name},</p>
             <p>We were unable to verify your payment for the following reason: <b>${reason}</b></p>
             <p>${notes}</p>
             <p>Please contact our billing team at finance@ITjobx.io or re-upload your transaction details.</p>`
        );

        res.json({ success: true, message: "Payment rejected and client notified" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// 📄 Invoices Management
exports.getAllInvoices = async (req, res) => {
    try {
        // 1. AUTO-SYNC: Find leads that should have an invoice but might be missing from Invoice collection
        console.log("[Finance Sync] Scanning for leads that need their Invoice record synced...");
        const potentialLeads = await Lead.find({
            $or: [
                { value: { $gt: 0 }, status: { $in: ["payment_received", "activated"] } },
                { invoice_sent_at: { $exists: true } }
            ]
        });

        let syncCount = 0;
        for (const lead of potentialLeads) {
            // Check if Invoice record actually exists
            const invoiceExists = await Invoice.findOne({ lead_id: lead._id });

            if (!invoiceExists) {
                const total = lead.total_paid || lead.value || 0;
                if (total === 0) continue;

                const base = total / 1.18;
                const gst = total - base;
                const invNum = lead.invoiceNumber || lead.invoice_ref || `NH-SYNC-${Math.floor(1000 + Math.random() * 9000)}`;

                await Invoice.create({
                    invoiceNumber: invNum,
                    lead_id: lead._id,
                    total_amount: total,
                    base_amount: Math.round(base),
                    cgst: Math.round(gst / 2),
                    sgst: Math.round(gst / 2),
                    status: "sent",
                    pdf_url: lead.invoice_url,
                    sent_at: lead.invoice_sent_at || lead.paid_at || new Date()
                });

                // Ensure lead has the flag
                if (!lead.invoice_sent_at) {
                    lead.invoice_sent_at = new Date();
                    lead.invoiceNumber = invNum;
                    await lead.save();
                }
                syncCount++;
                console.log(`[Finance Sync] Recovered missing invoice record for: ${lead.companyName || lead.company}`);
            }
        }
        if (syncCount > 0) console.log(`[Finance Sync] Total recovered: ${syncCount}`);

        // 2. Fetch all invoices from the collection
        const invoices = await Invoice.find()
            .populate({
                path: 'lead_id',
                model: 'Lead',
                select: 'companyName company workEmail hrName email name total_paid value contract_details'
            })
            .sort({ createdAt: -1 });

        // Ensure amounts are not zero if lead has data
        const enrichedInvoices = invoices.map(inv => {
            const invoice = inv.toObject();
            const lead = invoice.lead_id || {};

            if (!invoice.total_amount || invoice.total_amount === 0) {
                const leadTotal = lead.total_paid || (lead.contract_details || {}).total_amount || lead.value || 0;
                invoice.total_amount = leadTotal;
                invoice.base_amount = leadTotal / 1.18;
                invoice.cgst = (leadTotal - invoice.base_amount) / 2;
                invoice.sgst = (leadTotal - invoice.base_amount) / 2;
            }
            return invoice;
        });

        res.json(enrichedInvoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.generateInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const lead_id = id || req.body.lead_id;

        if (!lead_id) return res.status(400).json({ message: "Lead ID is required" });

        const lead = await Lead.findById(lead_id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });

        // Aggressively find the base price and discount (prioritize non-zero values)
        const base_price = lead.value || (lead.contract_details && lead.contract_details.base_amount) || 0;

        let discount_pct = lead.discountPercent || 0;
        if (!discount_pct && lead.contract_details && lead.contract_details.discount_percent) {
            discount_pct = lead.contract_details.discount_percent;
        }

        const discount_amt = (base_price * discount_pct) / 100;
        const after_discount = base_price - discount_amt;
        const gst = after_discount * 0.18;
        const total_payable = after_discount + gst;

        // Sync back to lead if they were zero but found in contract_details
        let needsSave = false;
        if ((!lead.value || lead.value === 0) && base_price > 0) {
            lead.value = base_price;
            needsSave = true;
        }
        if ((!lead.discountPercent || lead.discountPercent === 0) && discount_pct > 0) {
            lead.discountPercent = discount_pct;
            needsSave = true;
        }
        if (needsSave) await lead.save();

        const invoiceNumber = lead.invoiceNumber || `NH-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

        // Check if invoice already exists
        const existingInvoice = await Invoice.findOne({ lead_id: lead._id });

        const pdfResult = await generateInvoicePDF({
            lead,
            baseAmount: base_price,
            discountPct: discount_pct
        });

        if (existingInvoice && existingInvoice.status !== 'paid') {
            // Update existing invoice
            existingInvoice.base_amount = Math.round(base_price);
            existingInvoice.discount_amount = Math.round(discount_amt);
            existingInvoice.cgst = Math.round(gst / 2);
            existingInvoice.sgst = Math.round(gst / 2);
            existingInvoice.total_amount = Math.round(total_payable);
            existingInvoice.pdf_url = pdfResult.url;
            existingInvoice.sent_at = new Date();
            existingInvoice.invoice_number = existingInvoice.invoiceNumber; // Ensure consistency
            await existingInvoice.save();

            // Update lead
            lead.invoice_sent_at = new Date();
            lead.invoice_url = pdfResult.url;
            lead.invoiceNumber = existingInvoice.invoiceNumber;
            await lead.save();

            // Email Updated Invoice
            await sendEmail(
                lead.workEmail || lead.email,
                `Updated Tax Invoice — ${existingInvoice.invoiceNumber}`,
                "We have updated your tax invoice with the revised pricing. Please find it attached.",
                `<h3>Updated Tax Invoice</h3>
                 <p>Hello ${lead.hrName || lead.name},</p>
                 <p>Your tax invoice ${existingInvoice.invoiceNumber} has been updated to reflect the new discount/pricing.</p>
                 <a href="${pdfResult.url}">Download Updated Invoice PDF</a>`,
                [{ filename: `${existingInvoice.invoiceNumber}.pdf`, content: pdfResult.buffer }]
            );

            return res.json({ success: true, message: "Invoice updated successfully", invoice: existingInvoice });
        }

        if (existingInvoice && existingInvoice.status === 'paid') {
            return res.status(400).json({ success: false, message: "Cannot update a paid invoice" });
        }

        // Find associated company if it exists (for dashboard linking)
        let company_id = lead.company_id;
        if (!company_id && (lead.workEmail || lead.email)) {
            const Company = require('../models/Company');
            const associatedCompany = await Company.findOne({
                $or: [{ official_work_email: lead.workEmail }, { email: lead.email }]
            });
            if (associatedCompany) company_id = associatedCompany._id;
        }

        const invoice = new Invoice({
            invoiceNumber,
            invoice_number: invoiceNumber,
            company_id: company_id,
            lead_id: lead._id,
            payment_id: lead.payment_id || lead.payment_link_id,
            base_amount: Math.round(base_price),
            discount_amount: Math.round(discount_amt),
            cgst: Math.round(gst / 2),
            sgst: Math.round(gst / 2),
            total_amount: Math.round(total_payable),
            status: "sent",
            pdf_url: pdfResult.url,
            sent_at: new Date(),
            sent_by: req.user.id || req.user.userId || req.user._id // Fallback to id
        });

        await invoice.save();

        // Update lead
        lead.invoice_sent_at = new Date();
        lead.invoice_url = pdfResult.url;
        lead.invoiceNumber = invoiceNumber;
        await lead.save();

        // Email Invoice to Company
        await sendEmail(
            lead.workEmail || lead.email,
            `Tax Invoice — ${invoiceNumber}`,
            "Please find your tax invoice for the ITjobx Enterprise Plan attached.",
            `<h3>Tax Invoice</h3>
             <p>Hello ${lead.hrName || lead.name},</p>
             <p>Thank you for your payment. Your tax invoice ${invoiceNumber} is now available.</p>
             <p>You can download it using the link below or from your dashboard.</p>
             <a href="${pdfResult.url}">Download Invoice PDF</a>`,
            [{ filename: `${invoiceNumber}.pdf`, content: pdfResult.buffer }]
        );

        res.json({ success: true, invoice });
    } catch (err) {
        console.error("FATAL ERROR IN GENERATE INVOICE:", err);
        res.status(500).json({ success: false, message: "Invoice generation failed", error: err.message });
    }
};

// 📊 GST Report
exports.getGSTReport = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate({
                path: 'lead_id',
                model: 'Lead',
                select: 'companyName total_paid value'
            })
            .sort({ createdAt: -1 });
        res.json(invoices);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
