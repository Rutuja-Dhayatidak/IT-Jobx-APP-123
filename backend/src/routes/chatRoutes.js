const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const chatController = require('../controllers/chatController');

// All chat routes require authentication
router.use(verifyToken);

router.get('/conversation', chatController.getOrCreateConversation);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);
router.post('/conversations/:conversationId/quick-action', chatController.sendQuickAction);
router.post('/conversations/:conversationId/request-agent', chatController.requestAgent);
router.patch('/conversations/:conversationId/read', chatController.markAsRead);
router.get('/unread-count', chatController.getUnreadCount);

module.exports = router;
