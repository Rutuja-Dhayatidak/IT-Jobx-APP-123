const mongoose = require('mongoose');

const ModerationSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In-Review', 'Resolved', 'Escalated'],
    default: 'Pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  resolutionNotes: String
}, { timestamps: true });

module.exports = mongoose.model('Moderation', ModerationSchema);
