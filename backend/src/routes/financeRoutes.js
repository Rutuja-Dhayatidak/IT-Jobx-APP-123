const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const verifyToken = require('../middleware/verifyToken');
const isFinanceAdmin = require('../middleware/isFinanceAdmin');

router.use(verifyToken, isFinanceAdmin);

// Dashboard
router.get('/dashboard', financeController.getDashboardStats);

// Revenue Analytics
router.get('/revenue', financeController.getRevenue);

// Subscription Plans
router.get('/plans', financeController.getPlans);
router.post('/plans', financeController.createPlan);
router.put('/plans/:id', financeController.updatePlan);
router.delete('/plans/:id', financeController.deletePlan);

// Employer Payments
router.get('/payments', financeController.getPayments);

// Pricing & Charges
router.get('/pricing', financeController.getPricing);
router.post('/pricing', financeController.updatePricing);

// Refunds
router.get('/refunds', financeController.getRefunds);
router.post('/refund/approve', financeController.approveRefund);
router.post('/refund/reject', financeController.rejectRefund);

// Invoices
router.get('/invoices', financeController.getInvoices);

// Reports
router.get('/reports', financeController.getReports);

module.exports = router;
