const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true
    },
    adminName: String,
    role: String,

    module: {
      type: String,
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },

    displayMessage: String, // Human-readable message for UI

    targetId: {
      type: String,
      index: true
    },

    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },

    reason: String,

    status: {
      type: String,
      enum: ["success", "failed"],
      lowercase: true,
      default: "success"
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low"
    },

    ipAddress: String,
    userAgent: String,

    source: {
      type: String,
      default: "admin_panel"
    },

    metadata: {
      device: String,
      browser: String,
      location: String
    },

    traceId: {
      type: String,
      required: true,
      index: true
    },

    performedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  { 
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Immutability
auditLogSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next(new Error("Audit logs cannot be modified."));
  }
  next();
});

// Performance Indexes
auditLogSchema.index({ module: 1, action: 1 });
auditLogSchema.index({ performedAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema, "auditlogs");
