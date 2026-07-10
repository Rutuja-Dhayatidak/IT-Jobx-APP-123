const mongoose = require('mongoose');

const companyOTPSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  expires_at: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('CompanyOTP', companyOTPSchema);
