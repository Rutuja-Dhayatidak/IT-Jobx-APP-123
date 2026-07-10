const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  targetId: mongoose.Schema.Types.ObjectId,
  targetType: String,
  details: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TrustLog', LogSchema);
