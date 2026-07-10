const Candidate = require('../models/Candidate');
const Company = require('../models/Company');
const CompanyOTP = require('../models/CompanyOTP');
const CompanyDocument = require('../models/CompanyDocument');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.sendOtp = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken middleware
    const user = await Candidate.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Save to DB
    await CompanyOTP.deleteMany({ user_id: userId }); // Clear old OTPs
    await CompanyOTP.create({
      user_id: userId,
      otp,
      expires_at: expiresAt
    });

    // Send email
    const subject = "Company Registration Verification";
    const text = `Your OTP code is ${otp}. It expires in 5 minutes.`;
    const html = `<p>Your OTP code is <b>${otp}</b>. It expires in 5 minutes.</p>`;
    
    await sendEmail(user.email, subject, text, html);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOtp Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    const otpRecord = await CompanyOTP.findOne({ user_id: userId, otp });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (new Date() > otpRecord.expires_at) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Mark user as otp_verified
    await Candidate.findByIdAndUpdate(userId, { otp_verified: true });

    res.status(200).json({ success: true, redirect: "/company/register" });
  } catch (error) {
    console.error("verifyOtp Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.registerCompany = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      company_name, 
      industry, 
      company_size, 
      website_url, 
      logo, 
      about_company,
      official_work_email,
      contact_person_name,
      mobile_number,
      company_location,
      gst_number,
      cin_number,
      pan_number
    } = req.body;

    const user = await Candidate.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.otp_verified) {
      return res.status(403).json({ success: false, message: "OTP not verified" });
    }

    // Check if user already has a pending or approved company
    const existingCompany = await Company.findOne({ owner_user_id: userId });
    if (existingCompany) {
      return res.status(400).json({ success: false, message: "You already have a company registration request" });
    }

    // --- FRAUD DETECTION CHECKS ---
    // 1. Duplicate Name
    const duplicateName = await Company.findOne({ name: { $regex: new RegExp(`^${company_name.trim()}$`, 'i') } });
    if (duplicateName) {
      return res.status(400).json({ success: false, message: "A company with this name is already registered" });
    }

    // 2. Duplicate Email
    const duplicateEmail = await Company.findOne({ official_work_email: official_work_email.toLowerCase().trim() });
    if (duplicateEmail) {
      return res.status(400).json({ success: false, message: "This work email is already in use by another company" });
    }

    // 3. Duplicate GST (if provided)
    if (gst_number) {
      const duplicateGST = await Company.findOne({ gst_number: gst_number.toUpperCase().trim() });
      if (duplicateGST) {
        return res.status(400).json({ success: false, message: "This GST number is already registered" });
      }
    }

    // 4. Duplicate CIN (if provided)
    if (cin_number) {
      const duplicateCIN = await Company.findOne({ cin_number: cin_number.toUpperCase().trim() });
      if (duplicateCIN) {
        return res.status(400).json({ success: false, message: "This CIN number is already registered" });
      }
    }

    // --- FORMAT VALIDATIONS ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(official_work_email)) {
      return res.status(400).json({ success: false, message: "Invalid work email format" });
    }

    if (gst_number) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(gst_number.toUpperCase().trim())) {
        return res.status(400).json({ success: false, message: "Invalid GST format (Example: 27ABCDE1234F1Z5)" });
      }
    }

    if (pan_number) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(pan_number.toUpperCase().trim())) {
        return res.status(400).json({ success: false, message: "Invalid PAN format (Example: ABCDE1234F)" });
      }
    }

    if (cin_number) {
      const cinRegex = /^[U|L][0-9]{5}[A-Z]{2}[0-9]{4}[P|G][L|T][C][0-9]{6}$/;
      if (!cinRegex.test(cin_number.toUpperCase().trim())) {
        return res.status(400).json({ success: false, message: "Invalid CIN format (Example: U72900MH2025PTC123456)" });
      }
    }

    // --- TRUST SCORE ALGORITHM ---
    let score = 0;

    // Check if official email domain (not free providers like gmail/yahoo/hotmail/etc)
    const freeDomains = ['gmail.com', 'yahoo.com', 'yahoo.co.in', 'hotmail.com', 'outlook.com', 'rediffmail.com', 'icloud.com'];
    const emailDomain = official_work_email.toLowerCase().split('@')[1];
    const isOfficialDomain = !freeDomains.includes(emailDomain);
    if (isOfficialDomain) {
      score += 25;
    }

    // Active Website
    if (website_url) {
      score += 15;
    }

    // GST Provided
    if (gst_number) {
      score += 20;
    }

    // PAN Provided
    if (pan_number) {
      score += 15;
    }

    // CIN Provided
    if (cin_number) {
      score += 15;
    }

    // Documents Upload check
    const hasUploadedDocs = req.files && Object.keys(req.files).length > 0;
    if (hasUploadedDocs) {
      score += 10;
    }

    // Categorize Risk Level based on trust score
    let risk_level = 'High';
    if (score >= 75) risk_level = 'Low';
    else if (score >= 40) risk_level = 'Medium';

    // Create Company Model
    const newCompany = await Company.create({
      owner_user_id: userId,
      name: company_name,
      email: user.email, // keeping account email
      logo,
      industry,
      company_size,
      website_url,
      about_company,
      official_work_email: official_work_email.toLowerCase().trim(),
      contact_person_name,
      mobile_number,
      company_location,
      gst_number: gst_number ? gst_number.toUpperCase().trim() : undefined,
      cin_number: cin_number ? cin_number.toUpperCase().trim() : undefined,
      pan_number: pan_number ? pan_number.toUpperCase().trim() : undefined,
      trust_score: score,
      risk_level,
      verification_status: 'pending',
      status: 'pending',
      trust_safety_status: 'pending'
    });

    // --- HANDLE DOCUMENT UPLOADS ---
    if (req.files) {
      const docFields = [
        { key: 'gst_cert', type: 'gst_cert' },
        { key: 'pan_card', type: 'pan_card' },
        { key: 'business_proof', type: 'business_proof' },
        { key: 'company_proof', type: 'company_proof' }
      ];

      for (const field of docFields) {
        if (req.files[field.key] && req.files[field.key][0]) {
          const fileObj = req.files[field.key][0];
          await CompanyDocument.create({
            company_id: newCompany._id,
            document_type: field.type,
            document_url: fileObj.path || fileObj.secure_url, // path holds cloudinary URL
            uploaded_by: userId,
            verification_status: 'pending'
          });
        }
      }
    }

    // Update User
    user.company_id = newCompany._id;
    await user.save();

    // Notify admins
    const targetRoles = [
      "trust_safety", "Trust & Safety", 
      "moderator", 
      "platform_admin", "PLATFORM_ADMIN", 
      "super_admin", "SUPER_ADMIN", "superAdmin"
    ];
    
    const admins = await Candidate.find({ role: { $in: targetRoles } });

    if (admins.length > 0) {
      const subject = `Action Required: New Company Verification Pending [Score: ${score}/100]`;
      const text = `A new company "${company_name}" has registered and is pending approval.\n\n` +
                   `Trust Score: ${score}/100 (${risk_level} Risk)\n` +
                   `Representative: ${contact_person_name} (${mobile_number})\n` +
                   `Please review the request and documents in the admin dashboard.`;
      const html = `<p>A new company <b>"${company_name}"</b> has registered and is pending approval.</p>` +
                   `<p><b>Trust Score:</b> ${score}/100 (${risk_level} Risk)<br/>` +
                   `<b>Representative:</b> ${contact_person_name} (${mobile_number})</p>` +
                   `<p>Please review the request and documents in the Trust & Safety panel.</p>`;

      admins.forEach(admin => {
        if (admin.email) {
          sendEmail(admin.email, subject, text, html).catch(err => 
            console.error(`Failed to send notification to admin ${admin.email}:`, err)
          );
        }
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Company registered successfully for verification", 
      company: newCompany,
      trust_score: score,
      risk_level
    });
  } catch (error) {
    console.error("registerCompany Error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
};

exports.resubmitCompany = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await Candidate.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Find user's existing company
    const company = await Company.findOne({ owner_user_id: userId });
    if (!company) {
      return res.status(404).json({ success: false, message: "No company registration request found to resubmit." });
    }

    const {
      company_name,
      industry,
      company_size,
      website_url,
      about_company,
      official_work_email,
      contact_person_name,
      mobile_number,
      company_location,
      gst_number,
      cin_number,
      pan_number
    } = req.body;

    // Optional logo file upload if provided
    let logo = company.logo;
    if (req.files && req.files.logo && req.files.logo[0]) {
      logo = req.files.logo[0].path;
    }

    // Update basic details
    company.name = company_name || company.name;
    company.industry = industry || company.industry;
    company.company_size = company_size || company.company_size;
    company.website_url = website_url || company.website_url;
    company.about_company = about_company || company.about_company;
    if (official_work_email) {
      company.official_work_email = official_work_email.toLowerCase().trim();
    }
    company.contact_person_name = contact_person_name || company.contact_person_name;
    company.mobile_number = mobile_number || company.mobile_number;
    company.company_location = company_location || company.company_location;
    if (gst_number) company.gst_number = gst_number.toUpperCase().trim();
    if (cin_number) company.cin_number = cin_number.toUpperCase().trim();
    if (pan_number) company.pan_number = pan_number.toUpperCase().trim();

    // Recalculate Trust Score
    let score = 50;
    if (company.gst_number) score += 20;
    if (company.cin_number) score += 15;
    if (company.pan_number) score += 15;
    
    let risk_level = 'Low';
    if (score >= 80) risk_level = 'Low';
    else if (score >= 60) risk_level = 'Medium';
    else risk_level = 'High';

    company.trust_score = score;
    company.risk_level = risk_level;

    // Update statuses to "resubmitted" as requested!
    company.status = "resubmitted";
    company.verification_status = "resubmitted";
    company.trust_safety_status = "pending";
    company.isVerified = false; // Reset verified flag
    company.rejectionReason = undefined; // Clear previous rejection reason
    
    await company.save();

    // --- HANDLE DOCUMENT UPLOADS ---
    if (req.files) {
      const docFields = [
        { key: 'gst_cert', type: 'gst_cert' },
        { key: 'pan_card', type: 'pan_card' },
        { key: 'business_proof', type: 'business_proof' },
        { key: 'company_proof', type: 'company_proof' }
      ];

      for (const field of docFields) {
        if (req.files[field.key] && req.files[field.key][0]) {
          const fileObj = req.files[field.key][0];
          
          // Delete old document of same type if exists or update
          await CompanyDocument.deleteMany({ company_id: company._id, document_type: field.type });

          await CompanyDocument.create({
            company_id: company._id,
            document_type: field.type,
            document_url: fileObj.path || fileObj.secure_url,
            uploaded_by: userId,
            verification_status: 'pending'
          });
        }
      }
    }

    // Save Rejection Log / History as "resubmitted"
    const CompanyVerification = require('../models/CompanyVerification');
    await CompanyVerification.create({
      company_id: company._id,
      status: 'resubmitted'
    });

    res.json({ success: true, message: "Company registration request resubmitted successfully!", company });
  } catch (error) {
    console.error("resubmitCompany Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const CompanyTeamMember = require('../models/CompanyTeamMember');

    let company = null;
    let candidate = null;
    let teamMember = null;

    // 1. Try to find if this email is a primary Company Owner/Work Email
    company = await Company.findOne({
      $or: [
        { email: email.toLowerCase() },
        { official_work_email: email.toLowerCase() }
      ]
    });

    if (company) {
      // Find the associated user (Candidate) who is the owner
      candidate = await Candidate.findById(company.owner_user_id);
    } else {
      // 2. If no direct Company owner, check if they are an invited team member!
      teamMember = await CompanyTeamMember.findOne({
        email: email.toLowerCase(),
        status: { $ne: "removed" }
      });

      if (teamMember) {
        if (teamMember.status === "pending") {
          return res.status(403).json({
            success: false,
            message: "Your invitation is still pending. Please accept it via the link sent to your email to activate your account."
          });
        }
        if (teamMember.status === "inactive") {
          return res.status(403).json({
            success: false,
            message: "Your account has been deactivated. Please contact your administrator."
          });
        }
        if (teamMember.status === "active") {
          candidate = await Candidate.findById(teamMember.user_id);
          if (candidate) {
            company = await Company.findById(teamMember.company_id);
          }
        }
      }
    }

    if (!company || !candidate) {
      return res.status(404).json({
        success: false,
        message: "Employer or Company account not found"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check verification status of the company
    const verificationStatus = (company.verification_status || company.status || 'pending').toLowerCase();

    if (verificationStatus === "pending" || verificationStatus === "pending_review" || verificationStatus === "resubmitted") {
      return res.status(200).json({
        success: false,
        status: "pending_review",
        message: "Company verification is under review."
      });
    }

    if (verificationStatus === "rejected") {
      return res.status(200).json({
        success: false,
        status: "rejected",
        rejectionReason: company.rejectionReason || "No specific reason provided.",
        message: "Company verification was rejected."
      });
    }

    // Ensure company is approved
    if (verificationStatus !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Your company is not approved or has been suspended."
      });
    }

    // Synchronize candidate fields to ensure no inconsistent states
    if (candidate.role !== 'employer' || !candidate.is_employer || candidate.current_mode !== 'employer') {
      candidate.role = 'employer';
      candidate.is_employer = true;
      candidate.current_mode = 'employer';
      await candidate.save();
    }

    // Log the login timestamp for team members
    if (teamMember) {
      teamMember.last_login = new Date();
      await teamMember.save();
    }

    // Generate JWT Token including team details if they are a team member
    const payload = {
      id: candidate._id,
      email: candidate.email,
      role: candidate.role,
      name: `${candidate.firstName} ${candidate.lastName}`,
    };

    if (teamMember) {
      payload.team_role = teamMember.role;
      payload.permissions = teamMember.permissions;
    } else {
      // Primary owner acts as the master employer_admin with full permissions
      payload.team_role = "employer_admin";
      payload.permissions = [
        "full_access",
        "manage_team",
        "manage_jobs",
        "manage_billing",
        "view_analytics",
        "manage_company_profile"
      ];
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Filter sensitive fields and return user representation
    const userObj = candidate.toObject();
    delete userObj.password;
    userObj.team_role = payload.team_role;
    userObj.permissions = payload.permissions;

    res.status(200).json({
      success: true,
      token,
      user: userObj,
      company
    });

  } catch (error) {
    console.error("companyLogin Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

