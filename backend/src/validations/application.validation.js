const { z } = require("zod");
const { objectIdSchema } = require("./common.validation");

const applyJobSchema = z.object({
  jobId: objectIdSchema,
  resumeUrl: z.string().url("Invalid resume URL").or(z.string().trim().min(1, "Resume is required")),
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
