const Lead = require("../models/Lead");
const Payment = require("../models/Payment");
const Company = require("../models/Company");
const Candidate = require("../models/Candidate");
const AuditLog = require("../models/AuditLog");
const crypto = require("crypto");

/**
 * 🏢 Enterprise Management Controller
 */

// 1. Fetch leads
exports.getLeads = async (req, res) => {
    try {
        const leads = await Lead.find({ source: "Enterprise Inquiry" })
            .populate('salesRep', 'firstName lastName name email')
            .sort("-createdAt");
        res.json({ success: true, leads });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 2. Fetch payments for ledger
exports.getPayments = async (req, res) => {
    try {
        const leads = await Lead.find({ source: "Enterprise Inquiry" }).sort("-updatedAt");
        const ledger = leads.map(l => ({
            _id: l._id,
            companyName: l.companyName || l.company,
            invoiceRef: l.invoice_ref || l.invoice_number,
            amount: Number(l.total_paid) || Number(l.value) || 0,
            status: l.payment_status || l.status,
            method: l.payment_method || "NEFT/IMPS",
            transactionId: l.payment_id || l.payment_link_id || "PENDING",
            date: l.paid_at || l.payment_verified_at || l.updatedAt,
            invoiceUrl: l.invoice_url
        }));
        res.json({ success: true, ledger });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 3. Verify Payment
exports.verifyEnterprisePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionId, amountReceived, notes } = req.body;
        const lead = await Lead.findById(id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });

        lead.payment_status = "paid";
        lead.status = "payment_received";
        lead.payment_id = transactionId;
        lead.total_paid = Number(amountReceived);
        lead.paid_at = new Date();
        lead.payment_verified_at = new Date();
        lead.activities.push({
            text: `Payment VERIFIED MANUALLY. Amount: ₹${Number(amountReceived).toLocaleString()}. Ref: ${transactionId}`,
            time: new Date()
        });
        await lead.save();
        res.json({ success: true, message: "Payment verified successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 4. Get Account Managers (Include Active & Pending)
exports.getAccountManagers = async (req, res) => {
    try {
        const managers = await Candidate.find({
            role: { $in: ["superAdmin", "salesPanel", "Ops Admin", "Platform Admin", "sales_panel", "ops_admin", "platform_admin"] },
            status: { $in: ["active", "pending"] }
        }).select("firstName lastName name email role").lean();

        const formattedManagers = managers.map(m => ({
            _id: m._id,
            name: m.name || (m.firstName + (m.lastName ? ' ' + m.lastName : '')),
            email: m.email,
            role: m.role
        }));

        console.log(`Found ${formattedManagers.length} potential managers`);
        res.json(formattedManagers);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 5. Activate Plan
exports.activateEnterprisePlan = async (req, res) => {
    try {
        const { lead_id, company_id, account_manager_id, activation_notes } = req.body;
        const lead = await Lead.findById(lead_id);
        if (!lead) return res.status(404).json({ message: "Lead not found" });

        lead.status = "activated";
        lead.activated_at = new Date();
        if (account_manager_id) lead.account_manager = account_manager_id;
        lead.activities.push({ text: `Enterprise Plan ACTIVATED.`, time: new Date() });
        await lead.save();

        const company = await Company.findOne({ $or: [{ _id: company_id }, { email: lead.workEmail }] });
        if (company) {
            // Find the enterprise plan ID to link it correctly
            const Plan = require("../models/Plan");
            const enterprisePlan = await Plan.findOne({ plan_type: "enterprise" });

            company.plan_type = "enterprise";
            company.plan_status = "active";
            company.activated_at = new Date();

            // Set expiration to 1 year from now
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
            company.plan_expires_at = expiryDate;

            if (enterprisePlan) {
                company.plan_id = enterprisePlan._id;
            }

            if (account_manager_id) company.account_manager = account_manager_id;

            // Set unlimited permissions for enterprise
            company.permissions = {
                job_posts: -1,
                team_access: true,
                analytics: true,
                api_access: true
            };

            await company.save();
            console.log(`[Activation] Successfully linked company ${company.name} to enterprise plan.`);

            // Link any existing invoices for this lead to the company
            const Invoice = require("../models/Invoice");
            await Invoice.updateMany(
                { lead_id: lead._id },
                { $set: { company_id: company._id, status: "paid" } }
            );
        }

        // Send Activation Email
        const sendEmail = require("../utils/sendEmail");
        const companyEmail = company ? company.email : lead.workEmail;
        const companyName = company ? company.name : (lead.companyName || lead.company);

        if (companyEmail) {
            const emailSubject = "Welcome to ITjobx Enterprise! 🚀 Plan Activated Successfully";
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="background-color: #ecfdf5; color: #059669; padding: 12px 20px; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; margin-bottom: 10px;">
                            ITjobx Enterprise
                        </div>
                    </div>
                    <h2 style="color: #0f172a; text-align: center; margin-top: 0;">Your Plan is Now Active! 🎉</h2>
                    <p style="color: #334155; font-size: 15px;">Hello <strong>${lead.hrName || lead.name || 'Team'}</strong>,</p>
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">We are thrilled to inform you that your Enterprise Plan for <strong>${companyName}</strong> has been successfully activated by our administrative team.</p>
                    
                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 10px; margin: 25px 0;">
                        <h3 style="margin-top: 0; color: #0f172a; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 10px;">What happens next?</h3>
                        <ul style="color: #475569; padding-left: 20px; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                            <li style="margin-bottom: 10px;">Your dedicated Account Manager will reach out shortly to guide you through the onboarding process.</li>
                            <li style="margin-bottom: 10px;">You now have immediate access to <strong>Unlimited Job Posts</strong>, <strong>Team Workspaces</strong>, and <strong>Full Data Analytics</strong>.</li>
                            <li>You can log in to your dashboard anytime to configure your integrations and preferences.</li>
                        </ul>
                    </div>
                    
                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">If you have any immediate questions, please don't hesitate to reach out to our priority support team.</p>
                    <br>
                    <p style="color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        Welcome aboard,<br>
                        <strong style="color: #0f172a;">The ITjobx Enterprise Team</strong>
                    </p>
                </div>
            `;

            try {
                await sendEmail(companyEmail, emailSubject, "", emailHtml);
                console.log(`[Activation] Sent activation email to ${companyEmail}`);
            } catch (emailError) {
                console.error(`[Activation] Failed to send email to ${companyEmail}:`, emailError);
            }
        }

        res.json({ success: true, message: "Plan activated!" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 6. Active Clients
exports.getActiveClients = async (req, res) => {
    try {
        const companies = await Company.find({ plan_type: "enterprise", plan_status: "active" })
            .populate('account_manager', 'firstName lastName name email')
            .sort("-activated_at");
        res.json({ success: true, clients: companies });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 7. Update Note
exports.updateLeadNote = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (lead) {
            lead.activities.push({ text: `Admin Note: ${req.body.note}`, time: new Date() });
            await lead.save();
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false });
    }
};

// 8. Get Lead By ID
exports.getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id).populate('salesRep', 'firstName lastName name email');
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });
        res.json({ success: true, lead });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 9. Update Lead Status
exports.updateLeadStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const lead = await Lead.findById(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        lead.status = status;
        lead.activities.push({
            text: `Status updated to: ${status.replace(/_/g, ' ').toUpperCase()}`,
            time: new Date()
        });
        await lead.save();

        res.json({ success: true, message: "Status updated", lead });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 10. Delete Lead
exports.deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) return res.status(404).json({ success: false, message: "Lead not found" });

        // Log the deletion
        await AuditLog.create({
            adminId: req.user.userId || req.user._id,
            action: "DELETE_LEAD",
            target: "enterprise_leads",
            targetId: req.params.id,
            details: `Deleted enterprise lead: ${lead.companyName || lead.company}`
        });

        res.json({ success: true, message: "Lead deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
