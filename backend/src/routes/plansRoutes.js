const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const Lead = require('../models/Lead');
const Candidate = require('../models/Candidate');
const sendEmail = require('../utils/sendEmail');

// GET /api/plans - Fetch only active plans
router.get('/', async (req, res) => {
  try {
    // Ensure default plans are seeded if DB is empty
    const count = await Plan.countDocuments();
    if (count === 0) {
      const defaultPlans = [
        {
          plan_name: "Free Trial",
          plan_type: "free",
          price: 0,
          billing_cycle: "one_time",
          limits: { job_posts: 2, team_members: 1, applications: 10 },
          features: { analytics: false, featured_jobs: false, priority_support: false, custom_branding: false, api_access: false, dedicated_manager: false },
          support_type: "basic",
          is_active: true,
          is_popular: false
        },
        {
          plan_name: "Basic",
          plan_type: "basic",
          price: 999,
          billing_cycle: "monthly",
          limits: { job_posts: 5, team_members: 3, applications: -1 },
          features: { analytics: false, featured_jobs: false, priority_support: false, custom_branding: false, api_access: false, dedicated_manager: false },
          support_type: "email",
          is_active: true,
          is_popular: false
        },
        {
          plan_name: "Pro",
          plan_type: "pro",
          price: 2999,
          billing_cycle: "monthly",
          limits: { job_posts: 25, team_members: 10, applications: -1 },
          features: { analytics: true, featured_jobs: true, priority_support: true, custom_branding: false, api_access: false, dedicated_manager: false },
          support_type: "priority",
          is_active: true,
          is_popular: true
        },
        {
          plan_name: "Enterprise",
          plan_type: "enterprise",
          price: 9999,
          billing_cycle: "monthly",
          limits: { job_posts: -1, team_members: -1, applications: -1 },
          features: { analytics: true, featured_jobs: true, priority_support: true, custom_branding: true, api_access: true, dedicated_manager: true },
          support_type: "dedicated",
          is_active: true,
          is_popular: false
        }
      ];
      await Plan.create(defaultPlans);
    }

    const plans = await Plan.find({ is_active: true }).sort({ price: 1 }).lean();
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/plans/enterprise-inquiry - Register a B2B enterprise lead & trigger sales alerts
router.post('/enterprise-inquiry', async (req, res) => {
  try {
    const {
      companyName,
      companyWebsite,
      industry,
      companyLocation,
      contactName,
      designation,
      workEmail,
      phoneNumber,
      totalEmployees,
      monthlyHiringVolume,
      hrTeamSize,
      currentAts,
      budgetRange,
      featuresNeeded,
      requirementsMessage,
      preferredDate,
      preferredTime
    } = req.body;

    if (!companyName || !industry || !companyLocation || !contactName || !workEmail || !phoneNumber || !requirementsMessage) {
      return res.status(400).json({ success: false, message: "Required fields are missing." });
    }

    // 1. Locate an active Sales user (or any Administrator/Representative) in the database to assign this lead to
    let salesRep = await Candidate.findOne({ role: { $in: ["sales", "Sales Panel"] } });
    if (!salesRep) {
      // Fallback: If no dedicated Sales rep is available, find any system candidate
      salesRep = await Candidate.findOne();
    }

    if (!salesRep) {
      return res.status(500).json({ success: false, message: "No sales representative or administrator account exists in the platform database." });
    }

    // 2. Format a comprehensive text specification for the lead Notes field
    const formattedNotes = `🏢 COMPANY INFORMATION:
- Website: ${companyWebsite || 'None'}
- Industry: ${industry}
- Location: ${companyLocation}

👤 CONTACT PERSON DETAILS:
- Name: ${contactName}
- Designation: ${designation || 'None'}
- Work Email: ${workEmail}
- Phone Number: ${phoneNumber}

👥 COMPANY SIZE AND HIRING NEEDS:
- Total Employees: ${totalEmployees || 'Not Specified'}
- Monthly Hiring Volume: ${monthlyHiringVolume || 'Not Specified'}
- HR Team Size: ${hrTeamSize || 'None'}

⚙️ CURRENT SETUP AND REQUIREMENTS:
- Current ATS: ${currentAts || 'None'}
- Budget Range: ${budgetRange || 'None'}
- Features Needed: ${(featuresNeeded || []).join(', ') || 'None'}
- Message: ${requirementsMessage}

📅 DEMO PREFERENCE:
- Preferred Date: ${preferredDate || 'None'}
- Preferred Time: ${preferredTime || 'None'}`;

    // 3. Save Lead in DB
    const newLead = await Lead.create({
      name: contactName,
      email: workEmail,
      phone: phoneNumber,
      company: companyName,
      status: "new",
      value: 150000, // Estimated High-Value Corporate Lead Standard of ₹1,50,000
      source: "Enterprise Inquiry",
      salesRep: salesRep._id,
      notes: formattedNotes
    });

    // 4. Send Email Notification directly to Sales Team (salesRep.email and fallback EMAIL_USER)
    const salesTeamEmail = salesRep.email || process.env.EMAIL_USER;
    const emailSubject = `👑 ITjobx Enterprise Plan Inquiry - ${companyName}`;
    const emailText = `New Enterprise Lead Registered!\n\n${formattedNotes}`;

    const emailHtml = `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; border-bottom: 2px solid #7048e8; padding-bottom: 15px; margin-bottom: 20px;">
          <span style="background-color: #f3f0ff; color: #7048e8; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 9999px;">👑 Enterprise Deal Desk</span>
          <h1 style="color: #130f2c; margin: 10px 0 0 0; font-size: 22px;">ITjobx Enterprise Inquiry</h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Priority high-value opportunity received</p>
        </div>
        
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">Dear <strong>ITjobx Sales Desk</strong>,</p>
        <p style="font-size: 14px; color: #334155; line-height: 1.5;">A new high-end corporate account has submitted an Enterprise Inquiry through the pricing portal. Here are the fully populated lead details:</p>
        
        <!-- COMPANY INFORMATION -->
        <div style="background-color: #f8fafc; border-left: 4px solid #7048e8; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
          <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">🏢 Company Information</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="width: 35%; color: #64748b; padding: 3px 0;"><strong>Company Name:</strong></td><td style="color: #0f172a; font-weight: 600;">${companyName}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Website:</strong></td><td style="color: #0f172a;"><a href="${companyWebsite || '#'}" style="color: #7048e8; text-decoration: none;">${companyWebsite || 'None'}</a></td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Industry:</strong></td><td style="color: #0f172a; text-transform: uppercase;">${industry}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Location:</strong></td><td style="color: #0f172a;">${companyLocation}</td></tr>
          </table>
        </div>

        <!-- CONTACT DETAILS -->
        <div style="background-color: #f8fafc; border-left: 4px solid #3b5bdb; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
          <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">👤 Contact Person Details</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="width: 35%; color: #64748b; padding: 3px 0;"><strong>Name:</strong></td><td style="color: #0f172a; font-weight: bold;">${contactName}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Designation:</strong></td><td style="color: #0f172a;">${designation || 'None'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Work Email:</strong></td><td style="color: #0f172a; font-weight: bold;">${workEmail}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Phone Number:</strong></td><td style="color: #0f172a; font-weight: bold;">${phoneNumber}</td></tr>
          </table>
        </div>

        <!-- COMPANY SIZE & HIRING -->
        <div style="background-color: #f8fafc; border-left: 4px solid #1098ad; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
          <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">👥 Size and Hiring Needs</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="width: 35%; color: #64748b; padding: 3px 0;"><strong>Total Employees:</strong></td><td style="color: #0f172a;">${totalEmployees || 'Not Specified'}</td></tr>
            <tr><td style="width: 35%; color: #64748b; padding: 3px 0;"><strong>Monthly Volume:</strong></td><td style="color: #0f172a;">${monthlyHiringVolume || 'Not Specified'}</td></tr>
            <tr><td style="width: 35%; color: #64748b; padding: 3px 0;"><strong>HR Team Size:</strong></td><td style="color: #0f172a;">${hrTeamSize || 'None'}</td></tr>
          </table>
        </div>

        <!-- SETUP & REQUIREMENTS -->
        <div style="background-color: #f8fafc; border-left: 4px solid #37b24d; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 15px;">
          <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">⚙️ Setup and Requirements</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="width: 35%; color: #64748b; padding: 3px 0;"><strong>Current ATS:</strong></td><td style="color: #0f172a;">${currentAts || 'None'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Budget Range:</strong></td><td style="color: #0f172a;">${budgetRange || 'None'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Features Needed:</strong></td><td style="color: #0f172a;">${(featuresNeeded || []).join(', ') || 'None'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Requirements Message:</strong></td><td style="color: #0f172a; line-height: 1.4;">${requirementsMessage}</td></tr>
          </table>
        </div>

        <!-- DEMO PREFERENCE -->
        <div style="background-color: #f8fafc; border-left: 4px solid #f76707; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
          <h3 style="color: #1e293b; margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">📅 Demo Preference</h3>
          <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
            <tr><td style="width: 35%; color: #64748b; padding: 3px 0;"><strong>Preferred Date:</strong></td><td style="color: #0f172a; font-weight: bold;">${preferredDate || 'None'}</td></tr>
            <tr><td style="color: #64748b; padding: 3px 0;"><strong>Preferred Time:</strong></td><td style="color: #0f172a; font-weight: bold;">${preferredTime || 'None'}</td></tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #475569;">This lead has been saved automatically in the database and assigned to Representative <strong>${salesRep.firstName || ''} ${salesRep.lastName || 'Sales Agent'}</strong>. You can find it under the Sales Panel Leads pipeline page.</p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">ITjobx B2B Enterprise Engine • Secured Deal Desk Alert</p>
      </div>
    `;

    // Try sending email via sendEmail utility
    try {
      await sendEmail(salesTeamEmail, emailSubject, emailText, emailHtml);
      console.log(`Sales team enterprise alert sent successfully to ${salesTeamEmail}`);
    } catch (e) {
      console.error("Failed to send sales alert email:", e);
    }

    res.status(201).json({
      success: true,
      message: "Enterprise inquiry submitted, saved in database, and Sales team alerted successfully!",
      lead: newLead
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
