const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const adminUserSchema = new Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: [
      'super_admin',
      'platform_admin',
      'finance_admin',
      'trust_safety_admin',
      'support_admin',
      'ops_admin',
      'moderator_admin',
      'sales_admin'
    ],
    required: true
  },
  isActive:     { type: Boolean, default: true },
  lastLoginAt:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('AdminUser', adminUserSchema);
