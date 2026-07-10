const express = require('express');
const router = express.Router();
const controller = require('../controllers/superAdminSubscriptionController');

// All routes here are pre-guarded with verifyToken and isSuperAdmin from superAdminRoutes.js
router.get('/', controller.getSubscriptions);
router.get('/:id', controller.getSubscriptionById);
router.put('/:id', controller.updateSubscription);
router.post('/override/:id', controller.overrideSubscription);
router.post('/refund/:id', controller.refundSubscription);

module.exports = router;
