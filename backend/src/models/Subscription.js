const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }, // Optional reference to raw Plan
  plan: {
    type: String,
    enum: ["free", "basic", "pro", "enterprise"],
    default: "free"
  },
  seatLimit: { type: Number, default: 3 },
  jobLimit: { type: Number, default: 5 },
  startDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "inactive", "expired"],
    default: "active"
  },
  autoRenew: { type: Boolean, default: true },
  permissions: [{ type: String }],
  usage: {
    jobsPosted: { type: Number, default: 0 },
    membersAdded: { type: Number, default: 0 },
    resumesDownloaded: { type: Number, default: 0 }
  },
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
