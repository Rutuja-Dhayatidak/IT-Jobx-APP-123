const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobHistorySchema = new Schema({
  jobId:         { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  companyId:     { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  action:        {
    type: String,
    enum: [
      'created', 'submitted', 'auto_moderation_passed',
      'auto_moderation_failed', 'assigned', 'review_started',
      'approved', 'rejected', 'escalated', 'published',
      'resubmitted', 'closed', 'expired', 'featured', 'unfeatured'
    ],
    required: true
  },
  performedBy:   { type: Schema.Types.ObjectId },
  performedByModel: { type: String, enum: ['Candidate', 'AdminUser', 'User'] },
  fromStatus:    { type: String },
  toStatus:      { type: String },
  note:          { type: String },
  metadata:      Schema.Types.Mixed,
}, { timestamps: true });

jobHistorySchema.index({ jobId: 1, createdAt: -1 });

module.exports = mongoose.model('JobHistory', jobHistorySchema);
