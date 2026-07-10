const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  amount: { type: Number, required: true }, // Total paid amount (with GST)
  subtotal: { type: Number, default: 0 },
  gstPercent: { type: Number, default: 18 },
  gstAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  transactionStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: { type: String }, // card, upi, netbanking, etc.
  transactionId: { type: String }, // razorpay_payment_id
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  invoiceUrl: { type: String },
  failureReason: { type: String },
  attempts: { type: Number, default: 1 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
