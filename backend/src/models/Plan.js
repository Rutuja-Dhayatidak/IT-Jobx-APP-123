const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  plan_name: { type: String, required: true },
  plan_type: {
    type: String,
    enum: ["free", "basic", "pro", "enterprise"],
    required: true
  },
  price: { type: Number, default: 0 },
  billing_cycle: {
    type: String,
    enum: ["monthly", "yearly", "one_time"],
    required: true
  },
  limits: {
    job_posts: { type: Number, default: -1 },       // -1 = unlimited
    team_members: { type: Number, default: -1 },    // -1 = unlimited
    applications: { type: Number, default: -1 }     // -1 = unlimited
  },
  features: {
    analytics: { type: Boolean, default: false },
    featured_jobs: { type: Boolean, default: false },
    priority_support: { type: Boolean, default: false },
    custom_branding: { type: Boolean, default: false },
    api_access: { type: Boolean, default: false },
    dedicated_manager: { type: Boolean, default: false }
  },
  support_type: {
    type: String,
    enum: ["basic", "email", "priority", "dedicated"],
    required: true
  },
  is_active: { type: Boolean, default: true },
  is_popular: { type: Boolean, default: false },
  subscribed_companies: { type: Number, default: 0 },
  monthly_revenue: { type: Number, default: 0 },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
