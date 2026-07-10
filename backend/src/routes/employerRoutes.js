const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const employerOnly = require('../middleware/employerOnly');
const employerController = require('../controllers/employerController');

// All employer routes require login and the employer role
router.use(verifyToken, employerOnly);

router.get('/profile', employerController.getProfile);
router.get('/jobs', employerController.getJobs);
router.get('/candidates', employerController.getCandidates);
router.get('/team', employerController.getTeam);
router.put('/settings', employerController.updateSettings);
router.post('/subscribe', employerController.subscribeToPlan);
router.get('/enterprise-status', employerController.getEnterpriseStatus);

module.exports = router;
