const mongoose = require('mongoose');

const FraudSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  },
  activityType: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String,
  isFlagged: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Fraud', FraudSchema);
