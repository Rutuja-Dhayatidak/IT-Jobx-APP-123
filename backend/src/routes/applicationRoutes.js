const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const verifyToken = require("../middleware/verifyToken");
const roleMiddleware = require("../middleware/roleMiddleware");

// Candidate application routes
router.post("/apply", verifyToken, roleMiddleware("candidate"), applicationController.submitApplication);
router.get("/my-applications", verifyToken, roleMiddleware("candidate"), applicationController.getMyApplications);

// Employer application routes
router.get("/job/:jobId", verifyToken, roleMiddleware("employer"), applicationController.getJobApplications);
router.patch("/:id/status", verifyToken, roleMiddleware("employer"), applicationController.updateApplicationStatus);

module.exports = router;
