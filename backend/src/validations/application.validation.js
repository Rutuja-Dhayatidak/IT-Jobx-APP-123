const { z } = require("zod");
const { objectIdSchema } = require("./common.validation");

const applyJobSchema = z.object({
  jobId: objectIdSchema,
  coverLetter: z.string().trim().max(2000, "Cover letter cannot exceed 2000 characters").optional()
}).strict("Unknown fields are not allowed");

const updateApplicationStatusSchema = z.object({
  status: z.enum(["applied", "under-review", "shortlisted", "interview", "selected", "rejected"], {
    errorMap: () => ({ message: "Invalid application status" })
  })
}).strict("Unknown fields are not allowed");

module.exports = {
  applyJobSchema,
  updateApplicationStatusSchema
};
