if (process.env.NODE_ENV !== "test") {
  require("dotenv").config();
}
const { z } = require("zod");

// Provide mock environment variables for test runs to prevent validation failure
if (process.env.NODE_ENV === "test" && process.env.BYPASS_TEST_DEFAULTS !== "true") {
  process.env.PORT = process.env.PORT || "5000";
  process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/test-db";
  process.env.JWT_SECRET = process.env.JWT_SECRET || "mock-jwt-access-secret-32-chars-long";
  process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "mock-jwt-refresh-secret-32-chars-long";
  process.env.SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "test-admin@itjobx.com";
  process.env.SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "supersecretadminpassword123";
}


// Define rejected weak values
const WEAK_PLACEHOLDERS = [
  "secret",
  "password",
  "123456",
  "your-secret-key",
  "change-me",
  "development-secret",
  "your_super_secret_key_2026",
  "admin123"
];

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.preprocess((val) => parseInt(val, 10), z.number().default(5000)),
  
  MONGO_URI: z.string({
    required_error: "MONGO_URI is required"
  }).refine(
    (val) => val.startsWith("mongodb://") || val.startsWith("mongodb+srv://"),
    "MONGO_URI must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://"
  ),

  JWT_SECRET: z.string({
    required_error: "JWT_SECRET is required"
  }).min(32, "JWT_SECRET must contain at least 32 characters"),

  JWT_REFRESH_SECRET: z.string({
    required_error: "JWT_REFRESH_SECRET is required"
  }).min(32, "JWT_REFRESH_SECRET must contain at least 32 characters"),

  JWT_OLD_SECRET: z.string().optional(),

  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),

  SUPER_ADMIN_EMAIL: z.string().email("SUPER_ADMIN_EMAIL must be a valid email"),
  SUPER_ADMIN_PASSWORD: z.string().min(8, "SUPER_ADMIN_PASSWORD must contain at least 8 characters"),
  SUPER_ADMIN_NAME: z.string().default("Super Admin"),

  EMAIL_USER: z.string().optional(),
  EMAIL_PASS: z.string().optional(),

  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  CLOUD_NAME: z.string().optional(),
  API_KEY: z.string().optional(),
  API_SECRET: z.string().optional(),

  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL").optional(),
  CORS_ALLOWED_ORIGINS: z.string().optional(),

  GLOBAL_RATE_LIMIT_WINDOW_MINUTES: z.preprocess((val) => (val ? parseInt(val, 10) : 15), z.number().default(15)),
  GLOBAL_RATE_LIMIT_MAX_REQUESTS: z.preprocess((val) => (val ? parseInt(val, 10) : 100), z.number().default(100)),
  LOGIN_RATE_LIMIT_WINDOW_MINUTES: z.preprocess((val) => (val ? parseInt(val, 10) : 15), z.number().default(15)),
  LOGIN_MAX_FAILED_ATTEMPTS: z.preprocess((val) => (val ? parseInt(val, 10) : 5), z.number().default(5)),
  LOGIN_BLOCK_DURATION_MINUTES: z.preprocess((val) => (val ? parseInt(val, 10) : 30), z.number().default(30)),
  OTP_RATE_LIMIT_WINDOW_MINUTES: z.preprocess((val) => (val ? parseInt(val, 10) : 10), z.number().default(10)),
  OTP_MAX_REQUESTS: z.preprocess((val) => (val ? parseInt(val, 10) : 3), z.number().default(3)),
  OTP_COOLDOWN_SECONDS: z.preprocess((val) => (val ? parseInt(val, 10) : 60), z.number().default(60)),
  REGISTER_RATE_LIMIT_MAX: z.preprocess((val) => (val ? parseInt(val, 10) : 5), z.number().default(5)),
  FORGOT_PASSWORD_RATE_LIMIT_MAX: z.preprocess((val) => (val ? parseInt(val, 10) : 3), z.number().default(3)),
  JOB_API_RATE_LIMIT_MAX: z.preprocess((val) => (val ? parseInt(val, 10) : 60), z.number().default(60)),
}).refine(
  (data) => data.JWT_SECRET !== data.JWT_REFRESH_SECRET,
  {
    message: "JWT_SECRET and JWT_REFRESH_SECRET must be different",
    path: ["JWT_REFRESH_SECRET"]
  }
).superRefine((data, ctx) => {
  const isProd = data.NODE_ENV === "production";

  // Production-specific checks
  if (isProd) {
    // 1. MongoDB checks
    if (data.MONGO_URI.includes("localhost") || data.MONGO_URI.includes("127.0.0.1")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production MongoDB URI cannot use localhost",
        path: ["MONGO_URI"]
      });
    }

    // 2. Reject weak values
    if (WEAK_PLACEHOLDERS.includes(data.JWT_SECRET.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production JWT_SECRET cannot use an insecure placeholder",
        path: ["JWT_SECRET"]
      });
    }

    if (WEAK_PLACEHOLDERS.includes(data.JWT_REFRESH_SECRET.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production JWT_REFRESH_SECRET cannot use an insecure placeholder",
        path: ["JWT_REFRESH_SECRET"]
      });
    }

    if (WEAK_PLACEHOLDERS.includes(data.SUPER_ADMIN_PASSWORD.toLowerCase())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production SUPER_ADMIN_PASSWORD cannot use an insecure placeholder",
        path: ["SUPER_ADMIN_PASSWORD"]
      });
    }

    // 3. HTTPS URL check
    if (data.FRONTEND_URL && !data.FRONTEND_URL.startsWith("https://")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Production FRONTEND_URL must use HTTPS",
        path: ["FRONTEND_URL"]
      });
    }
  }
});

let parsedEnv;
try {
  parsedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error.errors || error.issues) {
    const issues = error.errors || error.issues || [];
    const errorDetails = issues.map(err => `- ${err.path.join(".")}: ${err.message}`).join("\n");
    console.error(`\n❌ Environment validation failed:\n${errorDetails}\n`);
  } else {
    console.error("❌ Environment validation error:", error);
  }
  process.exit(1);
}

module.exports = parsedEnv;
