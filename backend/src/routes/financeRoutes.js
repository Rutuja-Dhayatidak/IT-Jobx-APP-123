const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const verifyToken = require('../middleware/verifyToken');
const isFinanceAdmin = require('../middleware/isFinanceAdmin');

// All finance routes are protected
router.use(verifyToken, isFinanceAdmin);

// Dashboard
router.get('/dashboard/stats', financeController.getFinanceStats);

// Payments
router.get('/payments/pending', financeController.getPendingPayments);
router.get('/payments/verified', financeController.getVerifiedPayments);
router.get('/payments/rejected', financeController.getRejectedPayments);
router.post('/payments/:id/verify', financeController.verifyPayment);
router.post('/payments/:id/reject', financeController.rejectPayment);

// Invoices
router.get('/invoices', financeController.getAllInvoices);
router.post('/invoices/generate', financeController.generateInvoice); // ✅ Confirming this POST route

// Reports
router.get('/revenue/monthly', financeController.getFinanceStats); 
router.get('/gst/report', financeController.getGSTReport);

module.exports = router;
