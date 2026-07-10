const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  moderatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  actionType: {
    type: String,
    required: true,
    enum: ['VIEW_REPORTS', 'REVIEW_REPORT', 'DELETE_POST', 'BAN_USER', 'UNBAN_USER', 'WARN_USER', 'APPROVE_JOB', 'REJECT_JOB', 'LOGIN']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  targetType: {
    type: String,
    enum: ['user', 'job', 'report', 'system'],
    required: true
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
