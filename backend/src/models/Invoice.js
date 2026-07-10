const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    invoice_number: { // Added to match existing DB unique index
      type: String,
      unique: true,
      sparse: true
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },
    lead_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead"
    },
    payment_id: {
      type: String,
      trim: true
    },
    base_amount: {
      type: Number,
      required: true
    },
    discount_amount: {
      type: Number,
      default: 0
    },
    cgst: {
      type: Number,
      required: true
    },
    sgst: {
      type: Number,
      required: true
    },
    total_amount: {
      type: Number,
      required: true
    },
    invoice_date: {
      type: Date,
      default: Date.now
    },
    due_date: {
      type: Date
    },
    status: {
      type: String,
      enum: ["pending", "sent", "overdue", "paid"],
      default: "pending"
    },
    pdf_url: {
      type: String,
      trim: true
    },
    cloudinary_id: {
      type: String
    },
    sent_at: {
      type: Date
    },
    sent_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },
    client_gstin: {
      type: String,
      trim: true
    },
    service_description: {
      type: String,
      default: "Enterprise Subscription Plan"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
