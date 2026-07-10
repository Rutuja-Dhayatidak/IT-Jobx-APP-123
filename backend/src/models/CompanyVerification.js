const mongoose = require('mongoose');

const CompanyVerificationSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  status: {
    type: String,
    enum: ['pending_review', 'rejected', 'resubmitted'],
    required: true
  },
  rejection_reason: {
    type: String
  },
  rejected_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  rejected_at: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('CompanyVerification', CompanyVerificationSchema);
