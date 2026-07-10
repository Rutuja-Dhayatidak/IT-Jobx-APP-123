const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const notificationController = require("../controllers/notificationController");

router.use(verifyToken);

router.get("/", notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
router.patch("/:id/read", notificationController.markAsRead);
router.post("/read-all", notificationController.markAllAsRead);

module.exports = router;
