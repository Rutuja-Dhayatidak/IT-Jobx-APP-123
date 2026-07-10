const express = require("express");
const router = express.Router();
const EnterpriseLead = require("../models/EnterpriseLead");
const Lead = require("../models/Lead");
const Candidate = require("../models/Candidate");
const sendEmail = require("../utils/sendEmail");
const invoiceController = require("../controllers/invoiceController");

// 🧾 Invoicing Routes
router.post("/invoice/generate", invoiceController.generateInvoice);

// POST /api/enterprise-leads/create - Register a new enterprise B2B lead
router.post("/create", async (req, res) => {
  // Debug log on backend console
  console.log("📥 Incoming Enterprise Inquiry Payload on Backend:", req.body);

  try {
    const {
      companyName,
      companyWebsite,
      industry,
      companyLocation,
      hrName,
      designation,
      workEmail,
      phoneNumber,
      totalEmployees,
      monthlyHiringVolume,
      hrTeamSize,
      currentATS,
      budgetRange,
      featuresNeeded,
      requirementsMessage
    } = req.body;

    // Backend Validation
    if (!companyName || !industry || !hrName || !workEmail || !phoneNumber || !totalEmployees) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing. Please verify companyName, industry, hrName, workEmail, phoneNumber, and totalEmployees are provided."
      });
    }

    // 1. Find a Sales Representative to assign the lead to
    let salesRep = await Candidate.findOne({ role: { $in: ["sales", "Sales Panel"] } });
    if (!salesRep) {
      salesRep = await Candidate.findOne(); // Fallback to first available system account
    }

    // 2. Build the save payload for EnterpriseLead
    const savePayload = {
      companyName,
      companyWebsite,
      industry,
      companyLocation,
      hrName,
      designation,
      workEmail,
      phoneNumber,
      totalEmployees,
      monthlyHiringVolume,
      hrTeamSize,
      currentATS,
      budgetRange,
      featuresNeeded: featuresNeeded || [],
      requirementsMessage,
      status: "new",
      source: "Enterprise Inquiry",
      assignedSalesRep: salesRep ? salesRep._id : null
    };

    // 3. Save directly to EnterpriseLead collection
    const newLead = await EnterpriseLead.create(savePayload);

    // 4. Save directly to Leads collection as well so it is visible in Compass 'leads' and the CRM Sales Panel!
    const formattedNotes = `🏢 COMPANY INFORMATION:
- Website: ${companyWebsite || "None"}
- Industry: ${industry}
- Location: ${companyLocation || "None"}

👥 SIZE AND HIRING:
- Total Employees: ${totalEmployees}
- Monthly Hiring: ${monthlyHiringVolume || "Not Specified"}
- HR Team Size: ${hrTeamSize || "None"}

⚙️ SETUP & REQUIREMENTS:
- Current ATS: ${currentATS || "None"}
- Budget Range: ${budgetRange || "None"}
- Features Needed: ${(featuresNeeded || []).join(", ") || "None"}
- Message: ${requirementsMessage || "None"}`;

    const leadSavePayload = {
      // Legacy support fields
      name: hrName,
      email: workEmail,
      phone: phoneNumber,
      company: companyName,
      status: "new",
      value: 150000, // INR 1,50,000 Custom B2B Lead Value estimate
      source: "Enterprise Inquiry",
      salesRep: salesRep ? salesRep._id : null,
      notes: formattedNotes,

      // High-Fidelity B2B Enterprise fields
      companyName,
      companyWebsite,
      industry,
      companyLocation,
      hrName,
      designation,
      workEmail,
      phoneNumber,
      totalEmployees,
      monthlyHiringVolume,
      hrTeamSize,
      currentATS,
      budgetRange,
      featuresNeeded: featuresNeeded || [],
      requirementsMessage,
      activities: [
        { text: "Lead assigned to you — Sales Representative" },
        { text: `Auto-reply email sent to ${workEmail}` },
        { text: "Lead created — form submitted by company" }
      ]
    };

    await Lead.create(leadSavePayload);

    // 4. Send Email notification directly to Sales Representative / Admin
    if (salesRep || process.env.EMAIL_USER) {
      const salesTeamEmail = (salesRep && salesRep.email) ? salesRep.email : process.env.EMAIL_USER;
      const emailSubject = `👑 ITjobx Enterprise Inquiry - ${companyName}`;
      const emailText = `New Enterprise B2B Lead Received!\n\nCompany Name: ${companyName}\nHR Name: ${hrName}\nEmail: ${workEmail}\nPhone: ${phoneNumber}\nEmployees: ${totalEmployees}`;

      const emailHtml = `
        <div style="font-family: system-ui, sans-serif; max-width: 650px; margin: auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #7048e8; padding-bottom: 15px; margin-bottom: 20px;">
            <span style="background-color: #f3f0ff; color: #7048e8; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 10px; border-radius: 9999px;">👑 Enterprise deal desk</span>
            <h1 style="color: #130f2c; margin: 10px 0 0 0; font-size: 22px;">ITjobx Enterprise Inquiry</h1>
            <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Priority corporate opportunity received</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <tr style="background-color: #f8fafc;"><td style="padding: 8px; font-weight: bold; width: 35%;">Company Name:</td><td style="padding: 8px;">${companyName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Website:</td><td style="padding: 8px;"><a href="${companyWebsite || '#'}" style="color: #7048e8; text-decoration: none;">${companyWebsite || 'None'}</a></td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Industry:</td><td style="padding: 8px;">${industry}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Location:</td><td style="padding: 8px;">${companyLocation || 'None'}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 8px; font-weight: bold;">HR Contact Name:</td><td style="padding: 8px;">${hrName}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Designation:</td><td style="padding: 8px;">${designation || 'None'}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Work Email:</td><td style="padding: 8px; font-weight: bold;">${workEmail}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone Number:</td><td style="padding: 8px;">${phoneNumber}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Total Employees:</td><td style="padding: 8px;">${totalEmployees}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Hiring Volume:</td><td style="padding: 8px;">${monthlyHiringVolume || 'Not specified'}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 8px; font-weight: bold;">HR Team Size:</td><td style="padding: 8px;">${hrTeamSize || 'None'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Current ATS:</td><td style="padding: 8px;">${currentATS || 'None'}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Budget Range:</td><td style="padding: 8px;">${budgetRange || 'None'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Features Needed:</td><td style="padding: 8px;">${(featuresNeeded || []).join(', ') || 'None'}</td></tr>
            <tr style="background-color: #f8fafc;"><td style="padding: 8px; font-weight: bold;">Message:</td><td style="padding: 8px; line-height: 1.4;">${requirementsMessage || 'None'}</td></tr>
          </table>

          <p style="font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            This inquiry has been saved successfully in the <strong>EnterpriseLead</strong> database.
          </p>
        </div>
      `;

      try {
        await sendEmail(salesTeamEmail, emailSubject, emailText, emailHtml);
        console.log(`✉️ Email alert successfully dispatched to Sales Rep at: ${salesTeamEmail}`);
      } catch (err) {
        console.error("⚠️ Failed to dispatch SMTP sales email notification:", err);
      }
    }

    // 5. Send dynamic Gusto-style confirmation email directly to the applicant/company workEmail after 5 seconds
    setTimeout(async () => {
      try {
        const inquiryId = `ENT-2026-${String(newLead._id).slice(-4).toUpperCase()}`;
        const companyNameClean = companyName || "Enterprise";

        const clientSubject = `💼 ITjobx Enterprise Plan Inquiry Received - ${companyNameClean}`;
        const clientText = `Thank you for your interest in the ITjobx Enterprise Plan. Inquiry ID: ${inquiryId}`;

        const clientHtml = `
          <div style="background-color: #f6f9fc; padding: 20px 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #4a5568; margin: 0;">
            <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; text-align: left;">
              
              <!-- Gusto-style Reddish Logo Brand Header -->
              <div style="text-align: center; padding: 35px 20px 20px 20px; border-bottom: 1px solid #f0f4f8;">
                <div style="font-size: 32px; font-weight: 900; color: #ff5a5f; letter-spacing: -1.5px; font-family: 'Plus Jakarta Sans', sans-serif;">
                  workn<span style="color: #2d3748;">AI</span>
                </div>
                <div style="font-size: 18px; font-weight: 700; color: #2d3748; margin-top: 10px; letter-spacing: -0.5px;">
                  Welcome to the team!
                </div>
              </div>

              <!-- Email Content Body -->
              <div style="padding: 35px 28px;">
                <p style="font-size: 14px; line-height: 1.6; font-weight: 700; color: #2d3748; margin-top: 0; margin-bottom: 15px;">
                  Dear ${companyNameClean} Team,
                </p>
                
                <p style="font-size: 13.5px; line-height: 1.6; color: #4a5568; margin-bottom: 15px;">
                  Thank you for your interest in the ITjobx Enterprise Plan.
                </p>
                
                <p style="font-size: 13.5px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;">
                  We have successfully received your enterprise inquiry and our enterprise solutions team is currently reviewing your requirements.
                </p>

                <!-- Inquiry Details Box (Gusto Style rounded card) -->
                <div style="background-color: #f7fafc; border: 1px solid #edf2f7; border-radius: 12px; padding: 20px; margin: 25px 0; font-size: 13px;">
                  <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #a0aec0; margin-bottom: 12px; font-family: sans-serif;">
                    Inquiry Details
                  </div>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 5px 0; color: #718096; font-weight: bold; width: 35%;">Company:</td>
                      <td style="padding: 5px 0; color: #2d3748; font-weight: 800;">${companyNameClean}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #718096; font-weight: bold;">Industry:</td>
                      <td style="padding: 5px 0; color: #2d3748; font-weight: 800;">${industry}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #718096; font-weight: bold;">Team Size:</td>
                      <td style="padding: 5px 0; color: #2d3748; font-weight: 800;">${totalEmployees} employees</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #718096; font-weight: bold;">Inquiry ID:</td>
                      <td style="padding: 5px 0; color: #718096; font-weight: 800;"><span style="font-family: monospace; background-color: #edf2f7; padding: 2px 6px; border-radius: 4px;">${inquiryId}</span></td>
                    </tr>
                  </table>
                </div>

                <!-- What Happens Next Section -->
                <div style="margin: 25px 0;">
                  <h4 style="font-size: 13px; font-weight: 800; color: #2d3748; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    What happens next?
                  </h4>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #4a5568;">
                    <tr><td style="padding: 4px 0; width: 25px; color: #319795; font-weight: bold; font-size: 14px;">✔</td><td style="padding: 4px 0;">Requirement Review</td></tr>
                    <tr><td style="padding: 4px 0; width: 25px; color: #319795; font-weight: bold; font-size: 14px;">✔</td><td style="padding: 4px 0;">Dedicated Sales Consultation</td></tr>
                    <tr><td style="padding: 4px 0; width: 25px; color: #319795; font-weight: bold; font-size: 14px;">✔</td><td style="padding: 4px 0;">Product Demo Scheduling</td></tr>
                    <tr><td style="padding: 4px 0; width: 25px; color: #319795; font-weight: bold; font-size: 14px;">✔</td><td style="padding: 4px 0;">Custom Pricing Discussion</td></tr>
                    <tr><td style="padding: 4px 0; width: 25px; color: #319795; font-weight: bold; font-size: 14px;">✔</td><td style="padding: 4px 0;">Enterprise Onboarding Assistance</td></tr>
                  </table>
                </div>

                <p style="font-size: 13.5px; line-height: 1.6; color: #4a5568; margin-top: 20px; margin-bottom: 25px;">
                  One of our enterprise specialists will contact you within the next <strong>15–30 minutes</strong>.
                </p>

                <!-- Gusto-style Teal/Cyan CTA Button -->
                <div style="text-align: center; margin: 30px 0 20px 0;">
                  <a href="http://www.ITjobx.com" style="background-color: #008080; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-size: 13px; font-weight: 800; text-decoration: none; display: inline-block; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    Get started with ITjobx 
                  </a>
                </div>

                <p style="font-size: 12px; color: #718096; line-height: 1.5; margin-top: 25px; text-align: center; border-top: 1px solid #f0f4f8; padding-top: 20px; margin-bottom: 15px;">
                  If you require immediate assistance, feel free to reply to this email or contact our enterprise support team.
                </p>

                <!-- Sign Off -->
                <div style="margin-top: 20px; text-align: center; font-size: 12px; line-height: 1.6; color: #718096;">
                  <strong>Best Regards,</strong><br/>
                      ITjobx Enterprise Team<br/>
                  <a href="mailto:enterprise@ITjobx.com" style="color: #319795; text-decoration: none;">enterprise@worknai.com</a> &middot; <a href="http://www.ITjobx.com" style="color: #319795; text-decoration: none;">www.worknai.com</a>
                </div>

              </div>

            </div>
          </div>
        `;

        await sendEmail(workEmail, clientSubject, clientText, clientHtml);
        console.log(`✉️ Gusto-style Enterprise confirmation email successfully dispatched to client: ${workEmail} after 5 seconds delay.`);
      } catch (err) {
        console.error("⚠️ Failed to dispatch background Gusto confirmation email to client:", err);
      }
    }, 5000);

    res.status(201).json({
      success: true,
      message: "Enterprise inquiry submitted successfully",
      lead: newLead
    });

  } catch (err) {
    console.error("🔴 Error in createEnterpriseLead backend controller:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
