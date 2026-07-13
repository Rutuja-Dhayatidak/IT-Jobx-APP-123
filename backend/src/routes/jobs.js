const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const employerOnly = require('../middleware/employerOnly');
const jobController = require('../controllers/jobController');

// --- Candidate & Public Routes (no authentication required) ---
router.get('/published', jobController.getPublishedJobs);
router.get('/published/:id', jobController.getPublishedJobDetail);
router.get('/suggested', verifyToken, jobController.getSuggestedJobs);
router.post('/:id/view', jobController.incrementViewCount);

// --- Employer-only Routes (require verifyToken & employer role validation) ---
router.get('/plan-usage', verifyToken, employerOnly, jobController.getPlanUsage);
router.get('/my', verifyToken, employerOnly, jobController.getMyJobs);
router.post('/', verifyToken, employerOnly, jobController.createJob);
router.get('/:id', verifyToken, employerOnly, jobController.getJobById);
router.patch('/:id', verifyToken, employerOnly, jobController.updateJob);
router.delete('/:id', verifyToken, employerOnly, jobController.deleteJob);
router.post('/:id/submit', verifyToken, employerOnly, jobController.submitJobForReview);
router.post('/:id/resubmit', verifyToken, employerOnly, jobController.resubmitJob);
router.patch('/:id/close', verifyToken, employerOnly, jobController.closeJob);

module.exports = router;
