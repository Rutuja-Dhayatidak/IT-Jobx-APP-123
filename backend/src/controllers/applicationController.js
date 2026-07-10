const mongoose = require("mongoose");
const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");
const Company = require("../models/Company");
const Notification = require("../models/Notification");
const Candidate = require("../models/Candidate");
const { sendEmail } = require("../services/emailService");

// Submit an application for a job
exports.submitApplication = async (req, res) => {
  try {
    const { jobId, resumeUrl, coverLetter } = req.body;
    const candidateId = req.user.id;

    if (!jobId) {
      return res.status(400).json({ message: "Job ID is required" });
    }

    if (!resumeUrl) {
      return res.status(400).json({ message: "Resume/CV is required" });
    }

    // 1. Fetch job details & company association
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // 2. Duplicate check
    const existingApplication = await JobApplication.findOne({ jobId, candidateId });
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this position" });
    }

    // 3. Create database application record
    const application = new JobApplication({
      jobId,
      candidateId,
      companyId: job.companyId,
      resumeUrl,
      coverLetter,
      status: 'applied'
    });

    await application.save();

    // 4. Increment the applyCount on the job post
    job.applyCount = (job.applyCount || 0) + 1;
    await job.save();

    // 5. Send email + notification to company (fire-and-forget)
    process.nextTick(async () => {
      try {
        const [company, candidate] = await Promise.all([
          Company.findById(job.companyId).select('official_work_email name owner_user_id'),
          Candidate.findById(candidateId).select('firstName lastName')
        ]);

        if (company) {
          const candidateName = candidate
            ? `${candidate.firstName} ${candidate.lastName || ''}`.trim()
            : 'A candidate';
          const appliedAt = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

          // Email to company
          await sendEmail({
            to: company.official_work_email,
            template: 'new_application',
            payload: {
              companyName: company.name,
              jobTitle: job.title,
              candidateName,
              appliedAt
            }
          });

          // In-app notification for company owner
          if (company.owner_user_id) {
            await Notification.create({
              recipient: company.owner_user_id,
              title: 'New Application Received',
              message: `${candidateName} applied for "${job.title}"`,
              type: 'new_application',
              relatedId: application._id
            });
          }
        }
      } catch (notifyErr) {
        console.error('Failed to send application notification:', notifyErr.message);
      }
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application
    });
  } catch (error) {
    console.error("Error in submitApplication controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all applications submitted by the logged-in candidate
exports.getMyApplications = async (req, res) => {
  try {
    const candidateId = req.user.id;

    const applications = await JobApplication.find({ candidateId })
      .populate({
        path: 'jobId',
        select: 'title department location locationType salaryBudget jobType status companyId',
        populate: {
          path: 'companyId',
          select: 'name logo'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error("Error in getMyApplications controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all applications for a specific job (Employer context)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Optional: Verify that the company owns the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const applications = await JobApplication.find({ jobId })
      .populate('candidateId', 'firstName lastName email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error("Error in getJobApplications controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Update status of a job application (Employer context)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['applied', 'under_review', 'interviewing', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid application status" });
    }

    const application = await JobApplication.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    res.json({
      success: true,
      message: `Application status updated to ${status}`,
      application
    });
  } catch (error) {
    console.error("Error in updateApplicationStatus controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
