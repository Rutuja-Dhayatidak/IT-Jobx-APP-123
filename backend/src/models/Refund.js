const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  rejectionReason: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
  processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Refund', refundSchema);
