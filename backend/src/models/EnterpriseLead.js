const mongoose = require("mongoose");

const enterpriseLeadSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    companyWebsite: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      required: true,
      trim: true
    },
    companyLocation: {
      type: String,
      trim: true
    },
    hrName: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    workEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    totalEmployees: {
      type: String,
      required: true,
      trim: true
    },
    monthlyHiringVolume: {
      type: String,
      trim: true
    },
    hrTeamSize: {
      type: String,
      trim: true
    },
    currentATS: {
      type: String,
      trim: true
    },
    budgetRange: {
      type: String,
      trim: true
    },
    featuresNeeded: {
      type: [String],
      default: []
    },
    requirementsMessage: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "demo_scheduled",
        "demo_done",
        "proposal_sent",
        "negotiating",
        "contract_pending",
        "contract_signed",
        "payment_received",
        "payment_verified",
        "rejected",
        "activated",
        "lost"
      ],
      default: "new"
    },
    // 💳 Financial & Verification Fields
    payment_verified: {
      type: Boolean,
      default: false
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin"
    },
    verified_at: {
      type: Date
    },
    verification_notes: {
      type: String,
      trim: true
    },
    payment_method: {
      type: String,
      enum: ["NEFT", "RTGS", "Razorpay", "Net Banking", "IMPS"],
    },
    transaction_id: {
      type: String,
      trim: true
    },
    bank_reference: {
      type: String,
      trim: true
    },
    rejection_reason: {
      type: String,
      trim: true
    },
    rejection_notes: {
      type: String,
      trim: true
    },
    total_paid: {
      type: Number
    },
    // 📄 Enterprise Proposal System Fields
    proposalToken: {
      type: String,
      trim: true
    },
    proposalTokenExpires: {
      type: Date
    },
    proposalSentAt: {
      type: Date
    },
    proposalVersion: {
      type: Number,
      default: 1
    },
    proposalPdfUrl: {
      type: String,
      trim: true
    },
    isProposalOpened: {
      type: Boolean,
      default: false
    },
    proposalOpenedAt: {
      type: Date
    },
    proposalAccepted: {
      type: Boolean,
      default: false
    },
    proposalAcceptedAt: {
      type: Date
    },
    changeRequested: {
      type: Boolean,
      default: false
    },
    changeTypes: {
      type: [String],
      default: []
    },
    changeDetails: {
      type: String,
      trim: true
    },
    changeRequestedAt: {
      type: Date
    },
    lostReason: {
      type: String,
      trim: true
    },
    lostAt: {
      type: Date
    },
    source: {
      type: String,
      default: "Enterprise Inquiry"
    },
    assignedSalesRep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("EnterpriseLead", enterpriseLeadSchema);
