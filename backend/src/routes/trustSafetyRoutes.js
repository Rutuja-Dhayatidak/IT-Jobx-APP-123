const express = require('express');
const router = express.Router();
const trustSafetyController = require('../controllers/trustSafetyController');
const verifyToken = require('../middleware/verifyToken');
const isTrustSafety = require('../middleware/isTrustSafety');

// Public Company Email Verification link endpoint (no active admin session required)
router.post('/company/verify-email-link', trustSafetyController.verifyCompanyEmailLink);

router.use(verifyToken, isTrustSafety);

router.get('/dashboard', trustSafetyController.getDashboardStats);
router.get('/reports', trustSafetyController.getReportsAndFlags);
router.get('/moderation', trustSafetyController.getModerationQueue);
router.post('/approve', trustSafetyController.approveContent);
router.post('/reject', trustSafetyController.rejectContent);
router.post('/escalate', trustSafetyController.escalateReport);

router.get('/fraud', trustSafetyController.getFraudAnalysis);

router.post('/action', trustSafetyController.takeEnforcementAction);
router.get('/action/history', trustSafetyController.getEnforcementHistory);

router.get('/blocked', trustSafetyController.getBlockedAccounts);
router.post('/unblock/:id', trustSafetyController.unblockUser);
router.get('/logs', trustSafetyController.getAuditLogs);
router.get('/search', trustSafetyController.searchData);

router.get('/kyc', trustSafetyController.getKYC);
router.post('/kyc/approve/:id', trustSafetyController.approveKYC);
router.post('/kyc/reject/:id', trustSafetyController.rejectKYC);

// Company Verification Routes
router.get('/company-requests', trustSafetyController.getCompanyRequests);
router.post('/company-requests/:id/approve', trustSafetyController.approveCompanyRequest);
router.post('/company-requests/:id/reject', trustSafetyController.rejectCompanyRequest);
router.post('/company-requests/:id/flag', trustSafetyController.flagCompanyRisk);
router.post('/company-requests/:id/verify-checklist', trustSafetyController.verifyChecklistItem);
router.post('/company-requests/:id/verify-document', trustSafetyController.verifyCompanyDocument);

// Verification link sending endpoint (Admin action)
router.post('/company/send-verification-link', trustSafetyController.sendCompanyEmailLink);
router.post('/update-verification', trustSafetyController.updateVerificationField);

module.exports = router;
