const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const { sendOtp, verifyOtp, registerCompany, resubmitCompany, companyLogin } = require('../controllers/companyController');

const { upload } = require('../middleware/upload');

router.post('/login', companyLogin);
router.post('/send-otp', verifyToken, sendOtp);
router.post('/verify-otp', verifyToken, verifyOtp);
router.post('/register', verifyToken, upload.fields([
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
