const Company = require("../models/Company");
const Lead = require("../models/Lead");
const Plan = require("../models/Plan");
const Candidate = require("../models/Candidate");
const sendEmail = require("../utils/sendEmail");
const { getEnterpriseWelcomeEmail } = require("../templates/emails/enterpriseWelcomeEmail");
const { getAccountManagerAssignmentEmail, getSalesPersonNotificationEmail } = require("../templates/emails/internalEnterpriseAlerts");

/**
 * Super Admin Logic for Activating Enterprise Plans
 */
exports.activateEnterprisePlan = async (req, res) => {
    try {
        const { lead_id, company_id, account_manager_id, contract_ref } = req.body;

        // 1. Fetch Records
        const lead = await Lead.findById(lead_id).populate('salesRep');
        const company = await Company.findById(company_id);
        const accountManager = await Candidate.findById(account_manager_id);

        if (!lead || !company || !accountManager) {
            return res.status(404).json({ message: "Required records (Lead/Company/Manager) not found" });
        }

        // 2. Validation
        if (lead.payment_status !== 'paid') {
            return res.status(400).json({ message: "Cannot activate. Payment has not been verified yet." });
        }

        // 3. Find Enterprise Plan ID
        let enterprisePlan = await Plan.findOne({ plan_type: 'enterprise', is_active: true });
        if (!enterprisePlan) {
            // Create a default enterprise plan if none exists
            enterprisePlan = await Plan.create({
                plan_name: "Enterprise Annual Plan",
                plan_type: "enterprise",
                price: lead.total_paid || 318600,
                billing_cycle: "yearly",
                support_type: "dedicated",
                limits: { job_posts: -1, team_members: -1, applications: -1 },
                features: {
                    analytics: true,
                    featured_jobs: true,
                    priority_support: true,
                    custom_branding: true,
                    api_access: true,
                    dedicated_manager: true
                }
            });
        }

        // 4. Update Company Status & Permissions
        const activationDate = new Date();
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        company.plan_type = "enterprise";
        company.plan_status = "active";
        company.plan_id = enterprisePlan._id;
        company.plan_started_at = activationDate;
        company.plan_expires_at = expiryDate;
        company.account_manager = accountManager._id;
        company.activated_by = req.user._id;
        company.activated_at = activationDate;

        company.permissions = {
            job_posts: -1,
            team_members: -1,
            applications: -1,
            analytics: true,
            featured_jobs: true,
            api_access: true,
            custom_branding: true,
            priority_support: true,
            sso_login: true,
            data_migration: true,
            dedicated_manager: true
        };

        await company.save();

        // 5. Update Lead & Onboarding Checklist
        lead.status = "activated";
        lead.company_id = company._id;
        lead.activated_at = activationDate;
        lead.activated_by = req.user._id;
        lead.account_manager = accountManager._id;
        lead.onboarding_start = activationDate;
        lead.onboarding_end = new Date(activationDate.getTime() + (28 * 24 * 60 * 60 * 1000));

        // 5.1 Link all previous invoices for this lead to the newly activated company
        const Invoice = require("../models/Invoice");
        await Invoice.updateMany(
            { lead_id: lead._id },
            { $set: { company_id: company._id } }
        );

        lead.onboarding = {
            week1: {
                title: "Account setup",
                done: false,
                tasks: [
                    { task: "Domain setup", done: false },
                    { task: "Company branding", done: false },
                    { task: "SSO integration", done: false },
                    { task: "Team accounts", done: false }
                ]
            },
            week2: {
                title: "Data migration",
                done: false,
                tasks: [
                    { task: "Old ATS export", done: false },
                    { task: "Candidate import", done: false },
                    { task: "Job listings import", done: false }
                ]
            },
            week3: {
                title: "Team training",
                done: false,
                tasks: [
                    { task: "HR team training", done: false },
                    { task: "Admin training", done: false },
                    { task: "Panel training", done: false }
                ]
            },
            week4: {
                title: "Go live",
                done: false,
                tasks: [
                    { task: "Test run complete", done: false },
                    { task: "Issues resolved", done: false },
                    { task: "Go live!", done: false }
                ]
            }
        };

        lead.activities.push({
            type: "plan_activated",
            text: `Enterprise Plan ACTIVATED by Super Admin. Assigned to ${accountManager.name}.`,
            note: req.body.activation_notes || "Enterprise plan activated by Super Admin",
            done_by: req.user._id,
            time: new Date()
        });

        await lead.save();

        // 5.1 Create Audit Log
        const AuditLog = require("../models/AuditLog");
        const crypto = require("crypto");

        await AuditLog.create({
            adminId: req.user._id,
            adminName: req.user.name || "Super Admin",
            module: "ENTERPRISE",
            action: "ACTIVATION",
            displayMessage: `Enterprise plan activated for ${company.name}`,
            targetId: company._id.toString(),
            newData: {
                contract_ref: lead.contract_ref,
                amount_paid: lead.total_paid,
                account_manager: accountManager.name
            },
            severity: "high",
            traceId: crypto.randomBytes(8).toString('hex')
        });

        // 6. Send Emails
        const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(lead.total_paid || 318600);

        // A. Welcome Email to Client
        const welcomeHtml = getEnterpriseWelcomeEmail({
            hrName: lead.hrName || lead.name,
            companyName: company.name,
            activationDate: activationDate.toLocaleDateString('en-IN'),
            expiryDate: expiryDate.toLocaleDateString('en-IN'),
            contractRef: contract_ref || lead.contract_ref,
            amountPaid: formattedAmount,
            managerName: accountManager.name,
            managerEmail: accountManager.email,
            managerPhone: accountManager.phone || "+91-XXXXXXXXXX",
            managerInitials: accountManager.name.split(' ').map(n => n[0]).join(''),
            dashboardUrl: `${process.env.FRONTEND_URL}/employer/dashboard`,
            contractUrl: lead.merged_contract_url || lead.contract_pdf_url
        });

        await sendEmail(company.official_work_email, "Welcome to ITjobx Enterprise! 🎉", "Your account is now active.", welcomeHtml);

        // B. Assignment Email to Account Manager
        const managerHtml = getAccountManagerAssignmentEmail({
            managerName: accountManager.name,
            companyName: company.name,
            contactName: lead.hrName || lead.name,
            contactEmail: company.official_work_email,
            contactPhone: lead.phoneNumber || lead.phone,
            contractRef: contract_ref || lead.contract_ref,
            amount: formattedAmount,
            activationDate: activationDate.toLocaleDateString('en-IN')
        });

        await sendEmail(accountManager.email, `New Enterprise Client Assigned — ${company.name}`, "Check your new assignment.", managerHtml);

        // C. Notification to Sales Person
        if (lead.salesRep) {
            const salesHtml = getSalesPersonNotificationEmail({
                salesName: lead.salesRep.name,
                companyName: company.name,
                amount: formattedAmount,
                contractRef: contract_ref || lead.contract_ref
            });
            await sendEmail(lead.salesRep.email, `Deal Activated! — ${company.name}`, "You closed an enterprise deal!", salesHtml);
        }

        res.status(200).json({
            success: true,
            message: "Enterprise plan activated successfully and notifications sent.",
            activation_details: {
                company: company.name,
                plan_expiry: expiryDate,
                account_manager: accountManager.name
            }
        });

    } catch (error) {
        console.error("Activation Error:", error);
        res.status(500).json({ message: "Failed to activate enterprise plan", error: error.message });
    }
};

/**
 * Get all leads ready for activation
 */
exports.getPendingActivations = async (req, res) => {
    try {
        const pending = await Lead.find({
            payment_status: 'paid',
            status: 'payment_received'
        }).populate('salesRep');
        res.status(200).json(pending);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pending activations" });
    }
};

/**
 * Get list of available account managers (Candidates with specific roles or just all for now)
 */
exports.getAccountManagers = async (req, res) => {
    try {
        // For now, we return all candidates who have been marked as internal/staff
        // or just all candidates for the demo
        const managers = await Candidate.find({ role: 'admin' }).select('name email phone');
        res.status(200).json(managers);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch account managers" });
    }
};
