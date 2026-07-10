const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  jobPostPrice: { type: Number, default: 499 },
  featuredPrice: { type: Number, default: 999 },
  hireCommission: { type: Number, default: 10 }, // percentage
  resumeAccessPrice: { type: Number, default: 1999 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }
}, { timestamps: true });

module.exports = mongoose.model('Pricing', pricingSchema);
