const autoModerationService = require('../services/autoModerationService');
const emailService = require('../services/emailService');

const initQueues = () => {
  console.log('Background task runners initialized successfully 📅');
};

const autoModerationQueue = {
  add: async (name, { jobId }) => {
    // Process async tasks in memory nextTick loop
    process.nextTick(async () => {
      try {
        console.log(`[Queue Runner] Processing auto-moderation check for jobId: ${jobId}`);
        await autoModerationService.moderateJob(jobId);
      } catch (err) {
        console.error('Queue job failure in auto-moderation:', err.message);
      }
    });
  }
};

const sendEmailQueue = {
  add: async (name, payload) => {
    process.nextTick(async () => {
      try {
        console.log(`[Queue Runner] Processing send-email task to: ${payload.to}`);
        await emailService.sendEmail(payload);
      } catch (err) {
        console.error('Queue job failure in send-email:', err.message);
      }
    });
  }
};

const auditLogQueue = {
  add: async (name, payload) => {
    process.nextTick(async () => {
      try {
        console.log(`[Queue Runner] Processing audit-log task:`, payload);
      } catch (err) {
        console.error('Queue job failure in audit logging:', err.message);
      }
    });
  }
};

module.exports = {
  initQueues,
  autoModerationQueue,
  sendEmailQueue,
  auditLogQueue
};
