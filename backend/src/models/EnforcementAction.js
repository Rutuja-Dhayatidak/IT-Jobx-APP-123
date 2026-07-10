const mongoose = require('mongoose');

const EnforcementActionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Block', 'Suspend', 'Warn', 'Restrict'],
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
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  duration: String, // e.g., '7 days' for suspension
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EnforcementAction', EnforcementActionSchema);
