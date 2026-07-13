const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema({
  companyId:    { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
  postedBy:     { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },

  title:        { type: String, required: true, trim: true },
  department:   { type: String, trim: true },
  locationType: { type: String, enum: ['remote', 'on-site', 'hybrid'], required: true },
  location:     { type: String, trim: true },
  salaryBudget: { type: String },
  experienceLevel: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Director'],
    required: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    required: true
  },
  skills:       [{ type: String, trim: true }],
  minimumExperienceMonths: { type: Number, default: 0 },
  maximumExperienceMonths: { type: Number, default: 0 },
  isActive:     { type: Boolean, default: true },
  description:  { type: String, required: true, minlength: 100 },
  openings:     { type: Number, default: 1, min: 1 },
  deadline:     { type: Date },

  status: {
    type: String,
    enum: [
      'draft',
      'pending_review',
      'under_review',
      'approved',
      'published',
      'rejected',
      'on_hold',
      'expired',
      'closed'
    ],
    default: 'draft',
    index: true
  },

  isFeatured:   { type: Boolean, default: false },
  featuredUntil: { type: Date },
  viewCount:    { type: Number, default: 0 },
  applyCount:   { type: Number, default: 0 },

  moderationFlags: [{
    type: { type: String },
    keyword: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high'] },
    detectedAt: { type: Date, default: Date.now }
  }],
  autoModerationScore: { type: Number, default: 0 },
  autoModerationPassed: { type: Boolean, default: null },

  assignedTo:    { type: Schema.Types.ObjectId, ref: 'Candidate' },
  assignedAt:    { type: Date },
  reviewStartedAt: { type: Date },
  reviewedBy:    { type: Schema.Types.ObjectId, ref: 'Candidate' },
  reviewedAt:    { type: Date },

  rejectionReason:   { type: String },
  rejectionCategory: { type: String },
  rejectionNote:     { type: String },

  resubmissionCount: { type: Number, default: 0 },
  resubmittedAt:     { type: Date },
  resubmissionNote:  { type: String },

  publishedAt:   { type: Date },
  expiresAt:     { type: Date },
  closedAt:      { type: Date },
  closedBy:      { type: Schema.Types.ObjectId, ref: 'Candidate' },

  planTier:     { type: String },
  slaDueAt:     { type: Date },
  slaBreached:  { type: Boolean, default: false },

  searchKeywords: [String],
}, {
  timestamps: true
});

jobSchema.index({ companyId: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ status: 1, expiresAt: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text', location: 'text' });

jobSchema.pre('save', function() {
  if ((this.isModified('title') && typeof this.title === 'string') || this.isModified('skills')) {
    const titleKeywords = typeof this.title === 'string' ? this.title.toLowerCase().split(' ') : [];
    const skillsKeywords = Array.isArray(this.skills) ? this.skills.map(s => typeof s === 'string' ? s.toLowerCase() : '') : [];
    this.searchKeywords = [
      ...titleKeywords,
      ...skillsKeywords
    ].filter(Boolean);
  }
});

module.exports = mongoose.model("Job", jobSchema);
