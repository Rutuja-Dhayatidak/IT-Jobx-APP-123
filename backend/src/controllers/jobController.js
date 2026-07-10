const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const JobHistory = require('../models/JobHistory');
const Company = require('../models/Company');
const Candidate = require('../models/Candidate');
const EmployerPlanUsage = require('../models/EmployerPlanUsage');
const { autoModerationQueue, sendEmailQueue } = require('../queues');
const { calculateSLA } = require('../utils/slaCalculator');
const { emitNotification } = require('../utils/socketService');

// Helper to resolve company ID for authenticated candidate/employer agent
const resolveCompanyId = async (req) => {
  if (req.user.companyId) return req.user.companyId;
  if (req.user.company_id) return req.user.company_id;

  // 1. Try resolving via Candidate profile company_id field
  const user = await Candidate.findById(req.user.id);
  if (user && user.company_id) {
    return user.company_id;
  }

  // 2. Try resolving via primary Company owner
  const company = await Company.findOne({ owner_user_id: req.user.id });
  if (company) {
    return company._id;
  }

  // 3. Try resolving via CompanyTeamMember assignment
  const CompanyTeamMember = require('../models/CompanyTeamMember');
  const activeMember = await CompanyTeamMember.findOne({ user_id: req.user.id, status: "active" });
  if (activeMember) {
    return activeMember.company_id;
  }

  return null;
};

// 1. Get Plan Usage Limits
exports.getPlanUsage = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) {
      return res.status(404).json({ success: false, message: 'Company association not found' });
    }

    const company = await Company.findById(companyId).populate('plan_id');
    const usage = await EmployerPlanUsage.findOne({ companyId }) || { jobPostsUsed: 0 };
    
    // Default mock limit rules if plan not associated
    const planName = company && company.plan_id ? company.plan_id.plan_name : 'Free Trial';
    const limit = company && company.plan_id && company.plan_id.limits ? company.plan_id.limits.job_posts : 5;

    res.json({
      success: true,
      used: usage.jobPostsUsed,
      limit: limit === -1 ? 9999 : limit,
      planName
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Employer's Own Job Posts (paginated/filtered)
exports.getMyJobs = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) {
      return res.status(404).json({ success: false, message: 'Company association not found' });
    }

    const { status, search } = req.query;
    const filter = { companyId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 }).lean();
    const jobIds = jobs.map(job => job._id);

    const applicationCounts = jobIds.length > 0
      ? await JobApplication.aggregate([
          { $match: { jobId: { $in: jobIds } } },
          { $group: { _id: '$jobId', count: { $sum: 1 } } }
        ])
      : [];

    const countsByJobId = applicationCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.count;
      return acc;
    }, {});

    const jobsWithApplicationCounts = jobs.map(job => {
      const actualApplyCount = countsByJobId[job._id.toString()] || 0;
      return {
        ...job,
        applyCount: actualApplyCount,
        applicants: actualApplyCount
      };
    });

    res.json({ success: true, jobs: jobsWithApplicationCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Create Draft Job Post
exports.createJob = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) {
      return res.status(404).json({ success: false, message: 'Company association not found' });
    }

    // Verify limit checking
    const company = await Company.findById(companyId).populate('plan_id');
    const usage = await EmployerPlanUsage.findOne({ companyId }) || { jobPostsUsed: 0 };
    const planLimit = company && company.plan_id && company.plan_id.limits ? company.plan_id.limits.job_posts : 5;

    if (planLimit !== -1 && usage.jobPostsUsed >= planLimit) {
      return res.status(403).json({
        success: false,
        code: 'JOB_LIMIT_EXCEEDED',
        used: usage.jobPostsUsed,
        limit: planLimit,
        planName: company && company.plan_id ? company.plan_id.plan_name : 'Free Trial'
      });
    }

    const jobPayload = {
      ...req.body,
      companyId,
      postedBy: req.user.id,
      status: 'draft',
      planTier: company && company.plan_id ? company.plan_id.plan_name : 'free'
    };

    const job = await Job.create(jobPayload);

    await JobHistory.create({
      jobId: job._id,
      companyId,
      action: 'created',
      fromStatus: 'none',
      toStatus: 'draft',
      performedBy: req.user.id,
      performedByModel: 'Candidate'
    });

    res.status(201).json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Get Job Details (owner verified)
exports.getJobById = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    const job = await Job.findOne({ _id: req.params.id, companyId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    // Retrieve timeline history logs
    const history = await JobHistory.find({ jobId: job._id }).sort({ createdAt: 1 }).lean();

    res.json({ success: true, job: { ...job.toObject(), history } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Update Draft or Rejected Job
exports.updateJob = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    const job = await Job.findOne({ _id: req.params.id, companyId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    if (job.status !== 'draft' && job.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only draft or rejected jobs can be updated' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. Delete Draft Job
exports.deleteJob = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    const job = await Job.findOne({ _id: req.params.id, companyId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    if (job.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft jobs can be deleted' });
    }

    await Job.deleteOne({ _id: job._id });

    res.json({ success: true, message: 'Job post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 7. Submit Job for Review
exports.submitJobForReview = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    const job = await Job.findOne({ _id: req.params.id, companyId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    if (job.status !== 'draft' && job.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only draft or rejected jobs can be submitted' });
    }

    // Set moderation status & SLA timer
    job.status = 'pending_review';
    job.slaDueAt = calculateSLA(job.planTier);
    await job.save();

    // Increment plan count
    await EmployerPlanUsage.updateOne(
      { companyId },
      { $inc: { jobPostsUsed: 1 } },
      { upsert: true }
    );

    await JobHistory.create({
      jobId: job._id,
      companyId,
      action: 'submitted',
      fromStatus: 'draft',
      toStatus: 'pending_review',
      performedBy: req.user.id,
      performedByModel: 'Candidate'
    });

    // Enqueue automated moderation checks
    await autoModerationQueue.add('check', { jobId: job._id });

    // Emit live socket to admin queues
    emitNotification('admin:moderators', 'job:new:submission', {
      jobId: job._id,
      title: job.title
    });

    const company = await Company.findById(companyId);
    if (company && company.official_work_email) {
      await sendEmailQueue.add('dispatch', {
        to: company.official_work_email,
        template: 'job_submitted',
        payload: { jobTitle: job.title }
      });
    }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 8. Resubmit Rejected Job Post
exports.resubmitJob = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    const job = await Job.findOne({ _id: req.params.id, companyId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    if (job.status !== 'rejected') {
      return res.status(400).json({ success: false, message: 'Only rejected jobs can be resubmitted' });
    }

    if (job.resubmissionCount >= 3) {
      return res.status(400).json({ success: false, message: 'Maximum 3 resubmission limits reached for this job post' });
    }

    // Pre-fill / update values
    Object.assign(job, req.body);
    job.status = 'pending_review';
    job.resubmissionCount += 1;
    job.resubmittedAt = new Date();
    job.slaDueAt = calculateSLA(job.planTier);
    await job.save();

    // Increment plan usage if it was decremented on rejection
    await EmployerPlanUsage.updateOne(
      { companyId },
      { $inc: { jobPostsUsed: 1 } },
      { upsert: true }
    );

    await JobHistory.create({
      jobId: job._id,
      companyId,
      action: 'resubmitted',
      fromStatus: 'rejected',
      toStatus: 'pending_review',
      performedBy: req.user.id,
      performedByModel: 'Candidate',
      note: req.body.note || 'Resubmitted after edits'
    });

    await autoModerationQueue.add('check', { jobId: job._id });

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 9. Close/Deactivate Published Job
exports.closeJob = async (req, res) => {
  try {
    const companyId = await resolveCompanyId(req);
    const job = await Job.findOne({ _id: req.params.id, companyId });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    if (job.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Only live published jobs can be closed' });
    }

    job.status = 'closed';
    job.closedAt = new Date();
    job.closedBy = req.user.id;
    await job.save();

    await JobHistory.create({
      jobId: job._id,
      companyId,
      action: 'closed',
      fromStatus: 'published',
      toStatus: 'closed',
      performedBy: req.user.id,
      performedByModel: 'Candidate'
    });

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- CANDIDATE / PUBLIC JOB ACTIONS ---

// 10. Get Live Published Jobs (with dynamic filters & caching)
exports.getPublishedJobs = async (req, res) => {
  try {
    const { search, location, experienceLevel, jobType, locationType } = req.query;
    const filter = { status: 'published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (experienceLevel && experienceLevel !== 'All') {
      filter.experienceLevel = experienceLevel;
    }

    if (jobType && jobType !== 'All') {
      filter.jobType = jobType;
    }

    if (locationType && locationType !== 'All') {
      filter.locationType = locationType;
    }

    const jobs = await Job.find(filter)
      .populate('companyId', 'name official_work_email logo website')
      .sort({ publishedAt: -1, isFeatured: -1 });

    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 11. Get Single Published Job details
exports.getPublishedJobDetail = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, status: 'published' })
      .populate('companyId', 'name official_work_email logo website');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or inactive' });
    }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 12. Increment View Counter
exports.incrementViewCount = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    res.json({ success: true, viewCount: job ? job.viewCount : 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- PLATFORM ADMIN / MODERATOR ACTIONS ---

// 13. Get Moderate-Review Queue
exports.getAdminQueue = async (req, res) => {
  try {
    const { status, planTier, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    } else {
      filter.status = { $in: ['pending_review', 'under_review', 'rejected'] };
    }

    if (planTier && planTier !== 'all') {
      filter.planTier = planTier;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Sort by Plan Priority (Enterprise > Corporate > Pro > Starter > Free) and SLA due date
    const priorityMap = {
      'Enterprise': 5,
      'Corporate Elite': 4,
      'Pro': 3,
      'Starter': 2,
      'FREE': 1
    };

    const rawJobs = await Job.find(filter)
      .populate('companyId', 'name')
      .populate('assignedTo', 'name email')
      .lean();

    const sortedJobs = rawJobs.sort((a, b) => {
      const priorityA = priorityMap[a.planTier] || 0;
      const priorityB = priorityMap[b.planTier] || 0;
      if (priorityB !== priorityA) {
        return priorityB - priorityA; // Higher priority plan first
      }
      return new Date(a.slaDueAt || 0) - new Date(b.slaDueAt || 0); // Earliest SLA first
    });

    res.json({ success: true, queue: sortedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 14. Claim & Start Moderate Review
exports.startReview = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.status !== 'pending_review') {
      return res.status(400).json({ success: false, message: 'Job is not pending review' });
    }

    job.status = 'under_review';
    job.assignedTo = req.user.id;
    job.assignedAt = new Date();
    job.reviewStartedAt = new Date();
    await job.save();

    await JobHistory.create({
      jobId: job._id,
      companyId: job.companyId,
      action: 'review_started',
      fromStatus: 'pending_review',
      toStatus: 'under_review',
      performedBy: req.user.id,
      performedByModel: 'Candidate'
    });

    // Emit live update to Employer dashboard
    emitNotification(`company:${job.companyId}`, 'job:status:updated', {
      jobId: job._id,
      newStatus: 'under_review',
      message: `Your job post for "${job.title}" is now under review by platform moderators.`
    });

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 15. Action Moderation Review Decision (Approve / Reject)
exports.moderateJob = async (req, res) => {
  try {
    const { action, rejectionReason, rejectionCategory, rejectionNote } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const previousStatus = job.status;

    if (action === 'approve') {
      job.status = 'published';
      job.publishedAt = new Date();
      job.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days expiry
      job.reviewedBy = req.user.id;
      job.reviewedAt = new Date();
      job.slaBreached = new Date() > new Date(job.slaDueAt);
      
      await job.save();

      await JobHistory.create({
        jobId: job._id,
        companyId: job.companyId,
        action: 'approved',
        fromStatus: previousStatus,
        toStatus: 'published',
        performedBy: req.user.id,
        performedByModel: 'Candidate'
      });

      // Emit live status update to company room
      emitNotification(`company:${job.companyId}`, 'job:status:updated', {
        jobId: job._id,
        newStatus: 'published',
        message: `Congratulations! Your job post for "${job.title}" is approved and published live.`
      });

      const company = await Company.findById(job.companyId);
      if (company && company.official_work_email) {
        await sendEmailQueue.add('dispatch', {
          to: company.official_work_email,
          template: 'job_published',
          payload: { jobTitle: job.title }
        });
      }
    } else if (action === 'reject') {
      job.status = 'rejected';
      job.rejectionReason = rejectionReason;
      job.rejectionCategory = rejectionCategory;
      job.rejectionNote = rejectionNote;
      job.reviewedBy = req.user.id;
      job.reviewedAt = new Date();
      
      await job.save();

      // Decrement employer plan quota usage on rejection
      await EmployerPlanUsage.updateOne(
        { companyId: job.companyId },
        { $inc: { jobPostsUsed: -1 } }
      );

      await JobHistory.create({
        jobId: job._id,
        companyId: job.companyId,
        action: 'rejected',
        fromStatus: previousStatus,
        toStatus: 'rejected',
        performedBy: req.user.id,
        performedByModel: 'Candidate',
        note: rejectionNote
      });

      // Emit live rejection notification to company room
      emitNotification(`company:${job.companyId}`, 'job:status:updated', {
        jobId: job._id,
        newStatus: 'rejected',
        message: `Your job post for "${job.title}" was rejected: ${rejectionReason}.`
      });

      const company = await Company.findById(job.companyId);
      if (company && company.official_work_email) {
        await sendEmailQueue.add('dispatch', {
          to: company.official_work_email,
          template: 'job_rejected',
          payload: { jobTitle: job.title, reason: rejectionReason, note: rejectionNote }
        });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action decision' });
    }

    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 16. Bulk Moderate Decision Queue
exports.bulkModerate = async (req, res) => {
  try {
    const { jobIds, action, rejectionReason } = req.body;
    if (!jobIds || !Array.isArray(jobIds)) {
      return res.status(400).json({ success: false, message: 'Invalid job IDs collection list' });
    }

    const results = [];

    for (const id of jobIds) {
      const job = await Job.findById(id);
      if (!job) continue;

      const previousStatus = job.status;

      if (action === 'approve') {
        job.status = 'published';
        job.publishedAt = new Date();
        job.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await job.save();

        await JobHistory.create({
          jobId: job._id,
          companyId: job.companyId,
          action: 'approved',
          fromStatus: previousStatus,
          toStatus: 'published',
          performedBy: req.user.id,
          performedByModel: 'Candidate'
        });

        emitNotification(`company:${job.companyId}`, 'job:status:updated', {
          jobId: job._id,
          newStatus: 'published',
          message: `Approved: "${job.title}" is now published.`
        });
      } else if (action === 'reject') {
        job.status = 'rejected';
        job.rejectionReason = rejectionReason || 'Bulk moderate reject';
        await job.save();

        await EmployerPlanUsage.updateOne(
          { companyId: job.companyId },
          { $inc: { jobPostsUsed: -1 } }
        );

        await JobHistory.create({
          jobId: job._id,
          companyId: job.companyId,
          action: 'rejected',
          fromStatus: previousStatus,
          toStatus: 'rejected',
          performedBy: req.user.id,
          performedByModel: 'Candidate'
        });

        emitNotification(`company:${job.companyId}`, 'job:status:updated', {
          jobId: job._id,
          newStatus: 'rejected',
          message: `Rejected: "${job.title}" was bulk rejected.`
        });
      }

      results.push(id);
    }

    res.json({ success: true, processedCount: results.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 17. Queue & Moderation Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const publishedCount = await Job.countDocuments({ status: 'published' });
    const pendingCount = await Job.countDocuments({ status: 'pending_review' });
    const reviewCount = await Job.countDocuments({ status: 'under_review' });
    const rejectedCount = await Job.countDocuments({ status: 'rejected' });

    // SLA metrics
    const breachedCount = await Job.countDocuments({ slaBreached: true });

    // Performance trends (approval count in last 30 days)
    const trends = await Job.aggregate([
      { $match: { status: 'published', publishedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      metrics: {
        totalJobs,
        publishedCount,
        pendingCount,
        reviewCount,
        rejectedCount,
        breachedCount,
        trends
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
