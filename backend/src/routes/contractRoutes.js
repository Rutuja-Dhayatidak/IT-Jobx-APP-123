const express = require('express');
const router = express.Router();
const { verifySignToken, signContract } = require('../controllers/contractSignController');
const { generateContract } = require('../controllers/contractController');
const verifyToken = require('../middleware/verifyToken');

// Public routes for client signing
router.get('/verify-token/:token', verifySignToken);
router.post('/sign', signContract);

// Protected routes for sales panel
router.post('/generate-contract', verifyToken, generateContract);

module.exports = router;
