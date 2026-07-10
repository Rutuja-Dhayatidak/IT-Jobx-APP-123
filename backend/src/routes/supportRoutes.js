const express = require("express");
const router = express.Router();
const supportController = require("../controllers/supportController");
const verifyToken = require("../middleware/verifyToken");
const roleMiddleware = require("../middleware/roleMiddleware");

// All support routes require support role or superAdmin
router.use(verifyToken, roleMiddleware(["support", "superAdmin", "Support Admin"]));

router.get("/stats", supportController.getStats);
router.get("/tickets", supportController.getTickets);
router.post("/ticket/reply", supportController.replyTicket);
router.put("/ticket/:id/close", supportController.closeTicket);
router.get("/users", supportController.getUsers);

module.exports = router;
