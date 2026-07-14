const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const verifyToken = require("../middleware/verifyToken");
const roleMiddleware = require("../middleware/roleMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { applyJobSchema, updateApplicationStatusSchema } = require("../validations/application.validation");
const { z } = require("zod");
const { objectIdSchema } = require("../validations/common.validation");

const idParamSchema = z.object({
  id: objectIdSchema
});

const jobIdParamSchema = z.object({
  jobId: objectIdSchema
});

// Candidate application routes
router.post(
  "/apply",
  verifyToken,
  roleMiddleware("candidate"),
  validateRequest(applyJobSchema),
  applicationController.submitApplication
);

router.get("/my-applications", verifyToken, roleMiddleware("candidate"), applicationController.getMyApplications);

// Employer application routes
router.get(
  "/job/:jobId",
  verifyToken,
  roleMiddleware("employer"),
  validateRequest({ params: jobIdParamSchema }),
  applicationController.getJobApplications
);

router.patch(
  "/:id/status",
  verifyToken,
  roleMiddleware("employer"),
  validateRequest({
    params: idParamSchema,
    body: updateApplicationStatusSchema
  }),
  applicationController.updateApplicationStatus
);

module.exports = router;
