const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const employerPlanUsageSchema = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, unique: true, index: true },
  jobPostsUsed: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('EmployerPlanUsage', employerPlanUsageSchema);
