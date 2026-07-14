const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { sendOtp, verifyOtp, registerCompany, resubmitCompany, companyLogin } = require('../controllers/companyController');

const { upload } = require('../middleware/upload');
const loginRateLimiter = require('../middlewares/loginRateLimiter');
const { otpSendRateLimiter, otpVerifyRateLimiter } = require('../middlewares/otpRateLimiter');
const registerRateLimiter = require('../middlewares/registerRateLimiter');

router.post('/login', loginRateLimiter, companyLogin);
router.post('/send-otp', verifyToken, otpSendRateLimiter, sendOtp);
router.post('/verify-otp', verifyToken, otpVerifyRateLimiter, verifyOtp);

router.post('/register', verifyToken, registerRateLimiter, upload.fields([
  { name: 'gst_cert', maxCount: 1 },
  { name: 'pan_card', maxCount: 1 },
  { name: 'business_proof', maxCount: 1 },
  { name: 'company_proof', maxCount: 1 }
]), registerCompany);

router.put('/resubmit', verifyToken, upload.fields([
  { name: 'gst_cert', maxCount: 1 },
  { name: 'pan_card', maxCount: 1 },
  { name: 'business_proof', maxCount: 1 },
  { name: 'company_proof', maxCount: 1 }
]), resubmitCompany);

module.exports = router;
