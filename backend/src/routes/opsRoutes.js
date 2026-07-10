const express = require('express');
const router = express.Router();
const opsController = require('../controllers/opsController');
const verifyToken = require('../middleware/verifyToken');
const isOpsAdmin = require('../middleware/isOpsAdmin');

router.use(verifyToken, isOpsAdmin);

// Dashboard
router.get('/dashboard', opsController.getDashboardStats);

// User Management
router.get('/users', opsController.getUsers);

// Company Management
router.get('/companies', opsController.getCompanies);
router.post('/company/approve/:id', opsController.approveCompany);
router.post('/company/reject/:id', opsController.rejectCompany);

// Job Management
router.get('/jobs', opsController.getJobs);
router.delete('/job/:id', opsController.deleteJob);

// Content Moderation
router.get('/moderation', opsController.getModerationQueue);
router.post('/approve/:id', opsController.approveJob);
router.post('/reject/:id', opsController.rejectJob);

// Support Tickets
router.get('/support', opsController.getSupportTickets);
router.post('/support/resolve/:id', opsController.resolveTicket);

// Activity Logs
router.get('/logs', opsController.getActivityLogs);

module.exports = router;
