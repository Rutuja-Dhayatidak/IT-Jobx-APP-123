const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['user', 'job', 'company'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewing', 'Resolved', 'Dismissed', 'Escalated'],
    default: 'Pending'
  },
  adminNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
