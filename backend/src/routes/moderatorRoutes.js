const express = require('express');
const router = express.Router();
const moderatorController = require('../controllers/moderatorController');
const verifyToken = require('../middleware/verifyToken');
const checkPermission = require('../middleware/permissionMiddleware');

// Auth
router.post('/login', moderatorController.login);

// Protected routes
router.use(verifyToken);

// Dashboard
router.get('/stats', moderatorController.getStats);

// Reports
router.get('/reports', checkPermission('VIEW_REPORTS'), moderatorController.getReports);
router.put('/report/:id/review', checkPermission('REVIEW_REPORT'), moderatorController.reviewReport);

// Users
router.get('/users', checkPermission('VIEW_REPORTS'), moderatorController.getUsers);
router.put('/ban/:id', checkPermission('BAN_USER'), moderatorController.banUser);
router.put('/unban/:id', checkPermission('BAN_USER'), moderatorController.unbanUser);
router.put('/warn/:id', checkPermission('WARN_USER'), moderatorController.warnUser);

// Jobs
router.get('/jobs', checkPermission('VIEW_REPORTS'), moderatorController.getJobs);
router.put('/job/:id/approve', checkPermission('APPROVE_JOB'), moderatorController.approveJob);
router.put('/job/:id/reject', checkPermission('REJECT_JOB'), moderatorController.rejectJob);

// Logs
router.get('/logs', moderatorController.getLogs);

module.exports = router;
