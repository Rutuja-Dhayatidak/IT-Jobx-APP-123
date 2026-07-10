const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const jobController = require('../controllers/jobController');

// All platform admin review queue routes require token verification
router.use(verifyToken);

router.get('/queue', jobController.getAdminQueue);
router.post('/:id/review', jobController.startReview);
router.post('/:id/decision', jobController.moderateJob);
router.post('/bulk-moderate', jobController.bulkModerate);
router.get('/analytics', jobController.getAnalytics);

module.exports = router;
