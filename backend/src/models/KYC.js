const mongoose = require('mongoose');

const KYCSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  documentType: {
    type: String,
    required: true
  },
  documentUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  verifiedAt: Date,
  rejectionReason: String
}, { timestamps: true });

module.exports = mongoose.model('KYC', KYCSchema);
