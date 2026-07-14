const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const employerOnly = require("../middleware/employerOnly");
const jobController = require("../controllers/jobController");
const validateRequest = require("../middlewares/validateRequest");
const { createJobSchema, updateJobSchema, jobSearchQuerySchema } = require("../validations/job.validation");
const { z } = require("zod");
const { objectIdSchema } = require("../validations/common.validation");

const idParamSchema = z.object({
  id: objectIdSchema
});

const jobRateLimiter = require("../middlewares/jobRateLimiter");

// --- Candidate & Public Routes (no authentication required) ---
router.get(
  "/published",
  jobRateLimiter,
  validateRequest({ query: jobSearchQuerySchema }),
  jobController.getPublishedJobs
);

router.get(
  "/published/:id",
  jobRateLimiter,
  validateRequest({ params: idParamSchema }),
  jobController.getPublishedJobDetail
);

router.get(
  "/suggested",
  verifyToken,
  jobRateLimiter,
  validateRequest({ query: jobSearchQuerySchema }),
  jobController.getSuggestedJobs
);

router.post(
  "/:id/view",
  jobRateLimiter,
  validateRequest({ params: idParamSchema }),
  jobController.incrementViewCount
);

// --- Employer-only Routes (require verifyToken & employer role validation) ---
router.get("/plan-usage", verifyToken, employerOnly, jobController.getPlanUsage);
router.get("/my", verifyToken, employerOnly, jobController.getMyJobs);

router.post(
  "/",
  verifyToken,
  employerOnly,
  validateRequest(createJobSchema),
  jobController.createJob
);

router.get(
  "/:id",
  verifyToken,
  employerOnly,
  validateRequest({ params: idParamSchema }),
  jobController.getJobById
);

router.patch(
  "/:id",
  verifyToken,
  employerOnly,
  validateRequest({
    params: idParamSchema,
    body: updateJobSchema
  }),
  jobController.updateJob
);

router.delete(
  "/:id",
  verifyToken,
  employerOnly,
  validateRequest({ params: idParamSchema }),
  jobController.deleteJob
);

router.post(
  "/:id/submit",
  verifyToken,
  employerOnly,
  validateRequest({ params: idParamSchema }),
  jobController.submitJobForReview
);

router.post(
  "/:id/resubmit",
  verifyToken,
  employerOnly,
  validateRequest({ params: idParamSchema }),
  jobController.resubmitJob
);

router.patch(
  "/:id/close",
  verifyToken,
  employerOnly,
  validateRequest({ params: idParamSchema }),
  jobController.closeJob
);

module.exports = router;
