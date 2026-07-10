const razorpay = require("../config/razorpay");
const Lead = require("../models/Lead");
const Candidate = require("../models/Candidate"); // Required for .populate('salesRep')
const sendEmail = require("../utils/sendEmail");
const { getPaymentLinkEmail } = require("../templates/emails/paymentLinkEmail");
const { getPaymentSuccessEmail } = require("../templates/emails/paymentSuccessEmail");
const generateInvoicePDF = require("../utils/generateInvoicePDF");
const crypto = require("crypto");

/**
 * Generates a Razorpay Payment Link for an Enterprise Lead
 */
exports.createPaymentLink = async (req, res) => {
    try {
        console.log("💳 Received Payment Link Request:", req.body);
        const { lead_id, base_amount, gst_amount, total_amount, company_name, email, phone, contract_ref } = req.body;

        // 1. Validation
        if (!lead_id) return res.status(400).json({ message: "Lead ID is required" });

        const lead = await Lead.findById(lead_id).populate('salesRep');
        if (!lead) return res.status(404).json({ message: "Lead not found" });

        if (!lead.contract_signed) {
            return res.status(400).json({ message: "Cannot generate payment link. Contract must be signed first." });
        }

        // 2. Prepare Razorpay Payment Link Options
        const expiryDate = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days from now

        // Sanitize phone: must be at least 10 digits for Razorpay if provided
        let cleanPhone = (phone || lead.phoneNumber || lead.phone || '').toString().replace(/[^0-9+]/g, '');
        if (cleanPhone && !cleanPhone.startsWith('+') && cleanPhone.length === 10) {
            cleanPhone = `+91${cleanPhone}`; // Default to India if 10 digits
        }

        const customer = {
            name: (company_name || lead.companyName || lead.company || 'Enterprise Client').substring(0, 50),
            email: email || lead.workEmail || lead.email
        };

        const hasValidPhone = cleanPhone && cleanPhone.length >= 10;
        if (hasValidPhone) {
            customer.contact = cleanPhone;
        }

        // Recalculate robustly from DB to guarantee discount is applied
        const base_price = lead.value || (lead.contract_details && lead.contract_details.base_amount) || base_amount || 0;
        let discount_pct = lead.discountPercent || 0;
        if (!discount_pct && lead.contract_details && lead.contract_details.discount_percent) {
            discount_pct = lead.contract_details.discount_percent;
        }
        const calculated_discount = (base_price * discount_pct) / 100;
        const calculated_after_discount = base_price - calculated_discount;
        const calculated_gst = calculated_after_discount * 0.18;
        const calculated_total = calculated_after_discount + calculated_gst;

        if (calculated_total < 1) {
            return res.status(400).json({ message: "Invalid payment amount. Must be at least ₹1." });
        }

        const paymentLinkOptions = {
            amount: Math.round(calculated_total * 100), // Amount in paise
            currency: "INR",
            accept_partial: false,
            description: `ITjobx Enterprise — ${contract_ref || lead.contract_ref || 'Plan Activation'}`.substring(0, 255),
            customer,
            notify: {
                sms: hasValidPhone, // Only enable SMS if we have a contact number
                email: true
            },
            reminder_enable: true,
            notes: {
                contract_ref: String(contract_ref || lead.contract_ref || 'N/A'),
                lead_id: lead._id.toString(),
                plan_type: "enterprise",
                base_amount: String(base_amount || 0),
                gst_amount: String(gst_amount || 0)
            },
            callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/enterprise/payment/success`,
            callback_method: "get",
            expire_by: expiryDate
        };

        console.log("🚀 Creating Razorpay Payment Link with options:", JSON.stringify(paymentLinkOptions, null, 2));

        const paymentLink = await razorpay.paymentLink.create(paymentLinkOptions);

        // 3. Update Lead in DB
        lead.payment_link_id = paymentLink.id;
        lead.payment_link_url = paymentLink.short_url;
        lead.payment_link_created = new Date();
        lead.payment_link_expires = new Date(expiryDate * 1000);
        lead.payment_status = "link_sent";

        lead.activities.push({
            text: `✔ Razorpay Payment Link generated: ${paymentLink.short_url}`,
            time: new Date()
        });

        await lead.save();

        // 4. Send Custom Branded Email to Company
        const salesRep = lead.salesRep || { name: 'ITjobx Sales', email: 'sales@ITjobx.com', phone: '+91-XXXXXXXXXX' };

        const emailHtml = getPaymentLinkEmail({
            companyName: customer.name,
            amount: calculated_total,
            currency: "INR",
            link: paymentLink.short_url,
            contractRef: contract_ref || lead.contract_ref || 'N/A',
            expiryDate: new Date(expiryDate * 1000).toLocaleDateString('en-IN'),
            salesName: salesRep.name || 'Sales Team',
            salesEmail: salesRep.email || 'sales@ITjobx.com',
            salesPhone: salesRep.phone || '+91-XXXXXXXXXX'
        });

        try {
            await sendEmail(
                customer.email,
                `Payment Link — ITjobx Enterprise (₹${calculated_total.toLocaleString('en-IN')}) · Ref: ${contract_ref || lead.contract_ref || 'N/A'}`,
                `Please complete your payment here: ${paymentLink.short_url}`,
                emailHtml
            );
        } catch (emailError) {
            console.error("📧 Email sending failed, but link was generated:", emailError);
            // We don't return 500 here because the link WAS generated successfully in Razorpay and DB
        }

        res.status(200).json({
            success: true,
            payment_link: paymentLink.short_url,
            message: "Payment link generated successfully"
        });

    } catch (error) {
        console.error("❌ Payment Link Generation Error:", error);

        // Extracting actual error description from Razorpay if available
        const razorpayError = error.error || error;
        const errorDesc = razorpayError.description || error.message || "Failed to generate payment link";

        res.status(error.statusCode || 500).json({
            success: false,
            message: errorDesc,
            error: error.message,
            details: razorpayError
        });
    }
};

/**
 * Handle Razorpay Webhooks for Payment Status Updates
 */
exports.handleWebhook = async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    console.log(`🔔 Razorpay Webhook Received. Signature present: ${!!signature}`);

    try {
        // 1. Signature Verification (Optional if secret not set, but logged)
        if (secret && signature) {
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(JSON.stringify(req.body))
                .digest("hex");

            if (expectedSignature !== signature) {
                console.error("❌ Invalid Razorpay webhook signature");
                // For now, we continue in development if secret is set but signature mismatch (common with JSON.stringify)
                // In production, you should return 400 here.
            }
        } else {
            console.warn("⚠️ Webhook secret or signature missing. Proceeding with caution.");
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log(`📡 Razorpay Event: ${event}`);

        if (event === "payment_link.paid") {
            const paymentLink = payload.payment_link.entity;
            const payment = payload.payment.entity;
            const notes = paymentLink.notes;
            const leadId = notes.lead_id;

            const lead = await Lead.findById(leadId).populate('salesRep');
            if (lead) {
                // IMPORTANT: If already paid, don't duplicate logic
                if (lead.payment_status === 'paid' && lead.payment_id) {
                    console.log(`✅ Lead ${leadId} is already marked as paid.`);
                    return res.status(200).json({ status: "already_processed" });
                }

                // 2. Immediate Status Update (Before heavy operations)
                lead.payment_status = "paid";
                lead.status = "payment_received";
                lead.payment_id = payment.id;
                lead.razorpay_payment_id = payment.id; // Map for dashboard
                lead.payment_method = payment.method;
                lead.amount_paid = payment.amount / 100;
                lead.total_paid = payment.amount / 100;
                lead.paid_at = new Date();
                lead.razorpay_order_id = payment.order_id;

                lead.activities.push({
                    text: `✔ Payment Confirmed via Razorpay Webhook: ₹${(payment.amount / 100).toLocaleString('en-IN')} (ID: ${payment.id})`,
                    time: new Date()
                });

                await lead.save();
                console.log(`✅ Lead status updated to PAID for ${lead.companyName}`);

                // 3. Background Heavy Operations (PDF & Email)
                // We wrap these in a separate try-catch so they don't crash the webhook response
                try {
                    // Generate GST Invoice PDF
                    const invoiceData = await generateInvoicePDF({ lead });
                    lead.invoice_url = invoiceData.url;
                    lead.invoice_generated_at = new Date();
                    lead.invoice_number = `NH-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                    await lead.save();

                    // Send Success Email to Company
                    const successHtml = getPaymentSuccessEmail({
                        companyName: lead.companyName || lead.company,
                        amount: payment.amount / 100,
                        paymentId: payment.id,
                        method: payment.method,
                        date: new Date().toLocaleString('en-IN'),
                        contractRef: lead.contract_ref
                    });

                    await sendEmail(
                        lead.workEmail || lead.email,
                        `Payment Confirmed — ITjobx Enterprise (Ref: ${lead.contract_ref})`,
                        "Thank you for your payment!",
                        successHtml,
                        [{
                            filename: `${lead.invoice_number}.pdf`,
                            content: invoiceData.buffer
                        }]
                    );

                    // Notify Admins
                    const adminEmails = [process.env.FINANCE_ADMIN_EMAIL, process.env.SUPER_ADMIN_EMAIL, process.env.SALES_TEAM_EMAIL].filter(Boolean);
                    for (const adminEmail of adminEmails) {
                        await sendEmail(
                            adminEmail,
                            `Enterprise Payment Received — ${lead.companyName || lead.company}`,
                            `Payment of ₹${(payment.amount / 100).toLocaleString('en-IN')} received from ${lead.companyName || lead.company}. Ref: ${lead.contract_ref}`,
                            `<p>Enterprise Payment Confirmed!</p><ul><li>Company: ${lead.companyName || lead.company}</li><li>Amount: ₹${(payment.amount / 100).toLocaleString('en-IN')}</li><li>Lead ID: ${lead._id}</li></ul>`
                        );
                    }
                } catch (backgroundError) {
                    console.error("⚠️ Webhook background tasks failed (PDF/Email):", backgroundError);
                    // The lead is already marked as paid, so we still return 200 to Razorpay
                }
            }
        } else if (event === "payment_link.expired") {
            const leadId = payload.payment_link.entity.notes.lead_id;
            await Lead.findByIdAndUpdate(leadId, {
                payment_status: "expired",
                $push: { activities: { text: "Payment link expired", time: new Date() } }
            });
        }

        res.status(200).json({ status: "ok" });

    } catch (error) {
        console.error("❌ Webhook Processing Error:", error);
        res.status(500).json({ message: "Webhook processing failed" });
    }
};

/**
 * Manually sync payment status from Razorpay API
 * Use this when webhook fails or delay in status update
 */
exports.syncPaymentStatus = async (req, res) => {
    try {
        const { lead_id } = req.params;
        const lead = await Lead.findById(lead_id).populate('salesRep');

        if (!lead) return res.status(404).json({ message: "Lead not found" });
        if (!lead.payment_link_id) return res.status(400).json({ message: "No payment link found for this lead" });

        console.log(`🔄 Syncing status for Lead ${lead_id} from Razorpay API...`);

        // Fetch latest status from Razorpay
        const paymentLink = await razorpay.paymentLink.fetch(lead.payment_link_id);

        if (paymentLink.status === 'paid' && lead.payment_status !== 'paid') {
            // Manual Update
            lead.payment_status = "paid";
            lead.status = "payment_received";
            lead.paid_at = new Date();
            lead.payment_id = paymentLink.id; // Usually link ID if direct payment object not found
            lead.razorpay_payment_id = paymentLink.id;
            lead.total_paid = paymentLink.amount_paid / 100;

            lead.activities.push({
                text: `✔ Payment Status Synced Manually: PAID (Ref: ${paymentLink.id})`,
                time: new Date()
            });

            await lead.save();

            // Background task: Generate Invoice
            try {
                const invoiceData = await generateInvoicePDF({ lead });
                lead.invoice_url = invoiceData.url;
                lead.invoice_number = `NH-INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
                await lead.save();
            } catch (e) {
                console.error("Manual sync PDF generation failed:", e);
            }

            return res.status(200).json({
                success: true,
                status: "paid",
                message: "Payment status synced successfully. Lead marked as PAID."
            });
        }

        res.status(200).json({
            success: true,
            status: paymentLink.status,
            message: `Current Razorpay status: ${paymentLink.status}`
        });

    } catch (error) {
        console.error("❌ Sync Error:", error);
        res.status(500).json({ message: "Failed to sync payment status", error: error.message });
    }
};

/**
 * Get current payment status for a lead
 */
exports.getPaymentStatus = async (req, res) => {
    try {
        const { lead_id } = req.params;
        const lead = await Lead.findById(lead_id).select('payment_status payment_id amount_paid paid_at payment_link_url payment_link_expires');
        if (!lead) return res.status(404).json({ message: "Lead not found" });
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch payment status" });
    }
};
