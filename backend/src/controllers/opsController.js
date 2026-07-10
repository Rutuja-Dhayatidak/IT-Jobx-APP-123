const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');
const { getSLAStatus } = require('../utils/slaCalculator');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await Candidate.countDocuments({ role: 'candidate' });
    const totalCompanies = await Candidate.countDocuments({ role: 'employer' });
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const pendingApprovals = await Job.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalCompanies,
      activeJobs,
      pendingApprovals,
      userGrowth: [40, 50, 60, 80, 95, 120], // Placeholder
      jobTrends: [20, 35, 45, 30, 55, 70]   // Placeholder
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await Candidate.find({ role: 'candidate' }).select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await Candidate.find({ role: 'employer' }).select('-password').sort('-createdAt');
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveCompany = async (req, res) => {
  try {
    const company = await Candidate.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.json({ message: "Company approved", company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectCompany = async (req, res) => {
  try {
    const company = await Candidate.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json({ message: "Company rejected", company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'firstName lastName email')
      .populate('companyId', 'name gst_number pan_number plan_type plan_status isVerified status company_location industry')
      .sort('-createdAt');

    const mappedJobs = jobs.map(job => {
      const jobObj = job.toObject();

      // Map salaryBudget to salary
      jobObj.salary = jobObj.salaryBudget || 'Not Disclosed';

      // Map locationType to location
      jobObj.location = jobObj.locationType
        ? jobObj.locationType.charAt(0).toUpperCase() + jobObj.locationType.slice(1)
        : 'Remote';

      // Map company info
      const companyName = jobObj.companyId?.name;
      const recruiterName = jobObj.postedBy
        ? `${jobObj.postedBy.firstName} ${jobObj.postedBy.lastName}`
        : 'System Recruiter';

      jobObj.employer = { firstName: companyName || recruiterName };

      // Company verification summary for Ops Admin
      jobObj.companyInfo = {
        name: companyName || 'Unknown',
        gst: jobObj.companyId?.gst_number || null,
        pan: jobObj.companyId?.pan_number || null,
        planType: jobObj.companyId?.plan_type || 'free',
        planStatus: jobObj.companyId?.plan_status || 'inactive',
        isVerified: jobObj.companyId?.isVerified || false,
        companyStatus: jobObj.companyId?.status || 'pending',
        location: jobObj.companyId?.company_location || '',
        industry: jobObj.companyId?.industry || '',
      };

      // SLA status
      jobObj.slaStatus = getSLAStatus(jobObj.slaDueAt);

      // Quality signals
      jobObj.qualitySignals = {
        descLength: (jobObj.description || '').length,
        skillCount: (jobObj.skills || []).length,
        autoScore: jobObj.autoModerationScore || 0,
        autoPassed: jobObj.autoModerationPassed,
        flagCount: (jobObj.moderationFlags || []).length,
      };

      return jobObj;
    });

    res.json(mappedJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getModerationQueue = async (req, res) => {
  try {
    const pendingJobs = await Job.find({ status: { $in: ['approved', 'pending', 'pending_review'] } })
      .populate('postedBy', 'firstName lastName')
      .populate('companyId', 'name')
      .sort('-createdAt');

    const mappedJobs = pendingJobs.map(job => {
      const jobObj = job.toObject();

      // Map salaryBudget to salary
      jobObj.salary = jobObj.salaryBudget || 'Not Disclosed';

      // Map locationType to location
      jobObj.location = jobObj.locationType
        ? jobObj.locationType.charAt(0).toUpperCase() + jobObj.locationType.slice(1)
        : 'Remote';

      // Map company name or recruiter name for professional layout display
      const companyName = jobObj.companyId?.name;
      const recruiterName = jobObj.postedBy
        ? `${jobObj.postedBy.firstName} ${jobObj.postedBy.lastName}`
        : 'System Recruiter';

      jobObj.employer = {
        firstName: companyName || recruiterName
      };

      return jobObj;
    });

    res.json(mappedJobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const publishedAt = new Date();
    const job = await Job.findByIdAndUpdate(req.params.id, {
      status: 'published',
      publishedAt
    }, { new: true })
      .populate('postedBy', 'firstName lastName email')
      .populate('companyId', 'name email official_work_email company_location industry owner_user_id');

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // === NOTIFICATION 1: Email to company ===
    const companyEmail = job.companyId?.official_work_email || job.companyId?.email || job.postedBy?.email;
    const companyName = job.companyId?.name || 'Employer';
    const expiresAt = job.expiresAt ? new Date(job.expiresAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';
    const publishedDate = publishedAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) + ' — ' + publishedAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (companyEmail) {
      const emailHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          
          <!-- Header -->
          <div style="background: #16a34a; padding: 24px 32px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">✅ Job published successfully!</h1>
            <p style="color: #dcfce7; margin: 6px 0 0; font-size: 13px;">Your job post is now visible to thousands of candidates</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
              Hi ${companyName},
            </p>
            <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Your job posting has been reviewed and approved by our team. It is now live and visible to candidates on ITjobx.
            </p>

            <!-- Job Details Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px; width: 40%;">Job title</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700; text-align: right;">${job.title}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Department</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">${job.department || 'General'}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Location type</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">${(job.locationType || 'remote').charAt(0).toUpperCase() + (job.locationType || 'remote').slice(1)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Published on</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">${publishedDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280; font-size: 13px;">Expires on</td>
                <td style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 600; text-align: right;">${expiresAt}</td>
              </tr>
            </table>

            <!-- CTA Buttons -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/employer/jobs" 
                 style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700; margin-right: 8px;">
                View live job →
              </a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/employer/jobs" 
                 style="display: inline-block; background: #f1f5f9; color: #334155; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 700;">
                View applicants
              </a>
            </div>

            <!-- Footer note -->
            <p style="color: #9ca3af; font-size: 11px; line-height: 1.5; margin: 0; border-top: 1px solid #f3f4f6; padding-top: 16px;">
              You will receive email alerts as candidates apply. Manage your job from your ITjobx employer dashboard.
            </p>
          </div>
        </div>
      `;

      // Send asynchronously (don't block response)
      sendEmail(
        companyEmail,
        `Your job "${job.title}" is now live on ITjobx`,
        `Your job "${job.title}" has been published and is now live on ITjobx.`,
        emailHtml
      ).catch(err => console.error('Job publish email failed:', err.message));
    }

    // === NOTIFICATION 2: In-app bell notification ===
    const recipientId = job.companyId?.owner_user_id || job.postedBy?._id;
    if (recipientId) {
      Notification.create({
        recipient: recipientId,
        title: `Job published — ${job.title}`,
        message: `Your job is now live. Candidates can apply.`,
        type: 'job_published',
        relatedId: job._id,
      }).catch(err => console.error('Notification create failed:', err.message));
    }

    // === NOTIFICATION 3: Status auto-updates on MyJobPostsPage (already handled by status: 'published') ===

    res.json({ message: "Job published live successfully", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectJob = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const job = await Job.findByIdAndUpdate(req.params.id, {
      status: 'rejected',
      rejectionReason: reason || 'Content Policy Violation'
    }, { new: true });
    res.json({ message: "Job rejected successfully", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== OPS ADMIN 3 DECISIONS =====

// Decision 1: Publish is handled by approveJob above

// Decision 2: Send back (wapas bhejo) to moderator or company
exports.sendBackJob = async (req, res) => {
  try {
    const { sendTo, note } = req.body;
    // sendTo = 'moderator' or 'company'
    const newStatus = sendTo === 'company' ? 'draft' : 'pending_review';

    const job = await Job.findByIdAndUpdate(req.params.id, {
      status: newStatus,
      rejectionNote: note || '',
      resubmissionCount: 0,
    }, { new: true });

    if (!job) return res.status(404).json({ message: 'Job not found' });

    const target = sendTo === 'company' ? 'company for resubmission' : 'moderator for re-review';
    res.json({ message: `Job sent back to ${target}`, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Decision 3: Hold (more info chahiye)
exports.holdJob = async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findByIdAndUpdate(req.params.id, {
      status: 'on_hold',
      rejectionNote: reason || 'Additional information required',
    }, { new: true });

    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job placed on hold — awaiting more info', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ===== OPS ADMIN POWER TOOLS =====

// Override any job status
exports.overrideJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['draft', 'pending_review', 'approved', 'published', 'rejected', 'on_hold', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${validStatuses.join(', ')}` });
    }

    const updateFields = { status };
    if (status === 'published') updateFields.publishedAt = new Date();
    if (status === 'closed') updateFields.closedAt = new Date();

    const job = await Job.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: `Job status overridden to '${status}'`, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Power 3: Toggle featured/premium
exports.toggleFeatured = async (req, res) => {
  try {
    const { featured, days } = req.body;
    const updateFields = { isFeatured: !!featured };
    if (featured && days) {
      updateFields.featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
    if (!featured) {
      updateFields.featuredUntil = null;
    }

    const job = await Job.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    res.json({ message: featured ? 'Job marked as Featured' : 'Featured tag removed', job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Power 4: Get SLA breached jobs
exports.getSLABreaches = async (req, res) => {
  try {
    // Get jobs where SLA is breached OR slaDueAt has passed and still pending
    const now = new Date();
    const breachedJobs = await Job.find({
      $or: [
        { slaBreached: true },
        { slaDueAt: { $lt: now }, status: { $in: ['pending_review', 'approved', 'under_review'] } }
      ]
    })
      .populate('postedBy', 'firstName lastName')
      .populate('companyId', 'name plan_type')
      .sort('-createdAt');

    const mapped = breachedJobs.map(job => {
      const j = job.toObject();
      j.salary = j.salaryBudget || 'Not Disclosed';
      j.location = j.locationType ? j.locationType.charAt(0).toUpperCase() + j.locationType.slice(1) : 'Remote';
      j.employer = { firstName: j.companyId?.name || `${j.postedBy?.firstName || ''} ${j.postedBy?.lastName || ''}`.trim() || 'Recruiter' };
      return j;
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Power 6: Whitelist company for auto-approve
exports.whitelistCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, status: 'approved' },
      { new: true }
    );
    if (!company) return res.status(404).json({ message: 'Company not found' });

    res.json({ message: `${company.name} whitelisted — future jobs will auto-approve`, company });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSupportTickets = async (req, res) => {
  try {
    // Placeholder for support tickets
    res.json([
      { _id: '1', user: 'John Doe', issue: 'Login problem', status: 'Open', createdAt: new Date() },
      { _id: '2', user: 'Jane Smith', issue: 'Payment failed', status: 'Closed', createdAt: new Date() },
    ]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resolveTicket = async (req, res) => {
  try {
    res.json({ message: "Ticket resolved" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    // Placeholder for activity logs
    res.json([
      { _id: '1', action: 'Approved Job', admin: 'Ops Admin', target: 'Software Engineer', timestamp: new Date() },
      { _id: '2', action: 'Blocked User', admin: 'Ops Admin', target: 'spammer@test.com', timestamp: new Date() },
    ]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
