const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paymentMethod: { type: String },
  transactionId: { type: String, unique: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
