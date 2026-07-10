const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // Legacy support fields
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },

    // High-Fidelity B2B Enterprise fields
    companyName: {
      type: String,
      trim: true
    },
    companyWebsite: {
      type: String,
      trim: true
    },
    industry: {
      type: String,
      trim: true
    },
    companyLocation: {
      type: String,
      trim: true
    },
    hrName: {
      type: String,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    workEmail: {
      type: String,
      lowercase: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    },
    totalEmployees: {
      type: String,
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

    // CRM Operational status fields
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
        "activated",
        "lost"
      ],
      default: "new"
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },
    value: {
      type: Number,
      default: 0
    },
    discountPercent: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      default: "Direct Outreach"
    },
    salesRep: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true
    },
    followUpDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true
    },
    activities: [
      {
        text: { type: String, required: true },
        time: { type: Date, default: Date.now }
      }
    ],

    // 🗓️ 11 Required Enterprise Scheduling Database Fields
    demoDate: {
      type: String,
      trim: true
    },
    demoTime: {
      type: String,
      trim: true
    },
    demoDuration: {
      type: Number,
      default: 60
    },
    meetLink: {
      type: String,
      trim: true
    },
    calendarEventId: {
      type: String,
      trim: true
    },
    demoStatus: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled"
    },
    demoEmailsSent: {
      type: Boolean,
      default: false
    },
    demoReminderStatus: {
      type: String,
      enum: ["pending", "sent", "none"],
      default: "pending"
    },
    scheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate"
    },
    agenda: {
      type: String,
      trim: true
    },
    attendees: {
      type: [String],
      default: []
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

    // 📜 Enterprise Contract Management Fields
    contract_pdf_url: {
      type: String,
      trim: true
    },
    contract_ref: {
      type: String,
      trim: true
    },
    contract_generated_at: {
      type: Date
    },
    contract_sent_at: {
      type: Date
    },

    // Digital Signing Fields
    sign_token: {
      type: String,
      trim: true
    },
    sign_token_expires: {
      type: Date
    },
    contract_signed: {
      type: Boolean,
      default: false
    },
    signed_pdf_url: {
      type: String,
      trim: true
    },
    signed_at: {
      type: Date
    },
    signed_by_client: {
      type: String,
      trim: true
    },
    signer_designation: {
      type: String,
      trim: true
    },
    signature_image_url: {
      type: String,
      trim: true
    },
    signed_by_ITjobx: {
      type: String,
      trim: true
    },
    signature_audit: {
      ip_address: String,
      user_agent: String,
      agreed_at: Date,
      device_type: String
    },
    contract_details: {
      base_amount: Number,
      discount_percent: Number,
      gst_amount: Number,
      total_amount: Number,
      period_start: Date,
      period_end: Date,
      ref_number: String,
      payment_terms: String,
      notice_period: String,
      governing_law: String
    },

    // 🧾 Enterprise Invoicing Fields
    invoice_url: {
      type: String,
      trim: true
    },
    invoice_ref: {
      type: String,
      trim: true
    },
    invoice_generated_at: {
      type: Date
    },
    invoice_sent_at: {
      type: Date
    },
    payment_status: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "overdue"],
      default: "unpaid"
    },
    payment_verified_at: {
      type: Date
    },
    payment_verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate"
    },

    // 💳 Razorpay Payment Link Fields
    payment_link_id: {
      type: String,
      trim: true
    },
    payment_link_url: {
      type: String,
      trim: true
    },
    payment_link_created: {
      type: Date
    },
    payment_link_expires: {
      type: Date
    },
    payment_status: {
      type: String,
      enum: [
        "not_generated",
        "link_sent",
        "pending",
        "paid",
        "failed",
        "expired"
      ],
      default: "not_generated"
    },
    payment_id: {
      type: String,
      trim: true
    },
    payment_method: {
      type: String,
      trim: true
    },
    amount_paid: {
      type: Number
    },
    gst_amount: {
      type: Number
    },
    total_paid: {
      type: Number
    },
    paid_at: {
      type: Date
    },
    razorpay_order_id: {
      type: String,
      trim: true
    },
    invoiceNumber: {
      type: String,
      trim: true
    },

    // 🚀 Enterprise Onboarding Fields
    activated_at: { type: Date },
    activated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    account_manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
    onboarding_start: { type: Date },
    onboarding_end: { type: Date },
    onboarding: {
      week1: {
        title: { type: String, default: "Account setup" },
        done: { type: Boolean, default: false },
        tasks: [{ task: String, done: { type: Boolean, default: false } }]
      },
      week2: {
        title: { type: String, default: "Data migration" },
        done: { type: Boolean, default: false },
        tasks: [{ task: String, done: { type: Boolean, default: false } }]
      },
      week3: {
        title: { type: String, default: "Team training" },
        done: { type: Boolean, default: false },
        tasks: [{ task: String, done: { type: Boolean, default: false } }]
      },
      week4: {
        title: { type: String, default: "Go live" },
        done: { type: Boolean, default: false },
        tasks: [{ task: String, done: { type: Boolean, default: false } }]
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Lead", leadSchema);
