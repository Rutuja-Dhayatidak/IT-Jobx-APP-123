const { z } = require("zod");

const baseJobSchema = z.object({
  title: z.string({
    required_error: "Job title is required"
  }).trim().min(3, "Title must contain at least 3 characters").max(100),

  companyName: z.string({
    required_error: "Company name is required"
  }).trim().min(2, "Company name must contain at least 2 characters").max(100),

  description: z.string({
    required_error: "Job description is required"
  }).trim().min(50, "Description must be at least 50 characters").max(10000),

  employmentType: z.enum(["full-time", "part-time", "internship", "contract", "freelance"], {
    errorMap: () => ({ message: "Employment type must be full-time, part-time, internship, contract, or freelance" })
  }),

  workMode: z.enum(["remote", "hybrid", "onsite"], {
    errorMap: () => ({ message: "Work mode must be remote, hybrid, or onsite" })
  }),

  minExperience: z.number().min(0, "Minimum experience cannot be negative").max(50),
  maxExperience: z.number().min(0).max(50),

  minSalary: z.number().min(0, "Salary cannot be negative").optional(),
  maxSalary: z.number().min(0).optional(),
  currency: z.string().default("INR"),
  salaryPeriod: z.enum(["monthly", "yearly", "hourly"]).default("monthly"),

  skillsRequired: z.array(z.string().trim().min(1)).max(30, "Maximum of 30 skills allowed"),
  openings: z.number().int().min(1, "Openings must be at least 1").default(1),

  deadline: z.string().datetime("Deadline must be a valid ISO Date").refine((val) => {
    return new Date(val) > new Date();
  }, "Deadline must be a future date"),

  location: z.string().trim().optional()
}).strict("Unknown fields are not allowed");

// createJobSchema contains validation refinements on top of baseJobSchema
const createJobSchema = baseJobSchema.superRefine((data, ctx) => {
  // Validate experience range
  if (data.maxExperience < data.minExperience) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum experience cannot be less than minimum experience",
      path: ["maxExperience"]
    });
  }

  // Validate salary range
  if (data.minSalary && data.maxSalary && data.maxSalary < data.minSalary) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum salary cannot be less than minimum salary",
      path: ["maxSalary"]
    });
  }

  // Validate location requirement based on work mode
  if ((data.workMode === "onsite" || data.workMode === "hybrid") && !data.location) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Location is required for onsite and hybrid jobs",
      path: ["location"]
    });
  }
});

// updateJobSchema makes fields optional and adds partial validation checks
const updateJobSchema = baseJobSchema.partial().superRefine((data, ctx) => {
  if (data.minExperience !== undefined && data.maxExperience !== undefined && data.maxExperience < data.minExperience) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum experience cannot be less than minimum experience",
      path: ["maxExperience"]
    });
  }

  if (data.minSalary !== undefined && data.maxSalary !== undefined && data.maxSalary < data.minSalary) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Maximum salary cannot be less than minimum salary",
      path: ["maxSalary"]
    });
  }

  if (data.workMode && (data.workMode === "onsite" || data.workMode === "hybrid") && !data.location) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Location is required for onsite and hybrid jobs",
      path: ["location"]
    });
  }
});

// Job Search query validation
const jobSearchQuerySchema = z.object({
  page: z.preprocess((val) => (val ? parseInt(val, 10) : 1), z.number().min(1).default(1)),
  limit: z.preprocess((val) => (val ? parseInt(val, 10) : 10), z.number().min(1).max(50).default(10)),
  search: z.string().max(100, "Search term cannot exceed 100 characters").optional(),
  location: z.string().max(100).optional(),
  experience: z.preprocess((val) => (val ? parseInt(val, 10) : undefined), z.number().min(0).optional()),
  workMode: z.enum(["remote", "hybrid", "onsite"]).optional(),
  employmentType: z.enum(["full-time", "part-time", "internship", "contract", "freelance"]).optional(),
  sortBy: z.enum(["createdAt", "salary", "experience", "relevance"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
}).strict();

module.exports = {
  createJobSchema,
  updateJobSchema,
  jobSearchQuerySchema
};
