const { z } = require("zod");

// Phone number normalization and validation for Indian numbers
const phoneSchema = z.preprocess((val) => {
  if (typeof val !== "string") return val;
  let cleaned = val.replace(/[\s+-]/g, "");
  if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}, z.string().regex(/^[6-9]\d{9}$/, { message: "Invalid mobile number. Must be a 10-digit number starting with 6, 7, 8, or 9." }));

const registerSchema = z.object({
  firstName: z.string({
    required_error: "First name is required"
  }).trim()
    .min(2, "First name must contain at least 2 characters")
    .max(60, "First name cannot exceed 60 characters")
    .regex(/^[A-Za-z\s'-]+$/, "First name can only contain alphabets, spaces, hyphens, and apostrophes"),
  
  lastName: z.string().trim()
    .max(60, "Last name cannot exceed 60 characters")
    .regex(/^[A-Za-z\s'-]*$/, "Last name can only contain alphabets, spaces, hyphens, and apostrophes")
    .optional(),

  email: z.string({
    required_error: "Email address is required"
  }).trim()
    .toLowerCase()
    .email("Please enter a valid email address")
    .max(254, "Email address cannot exceed 254 characters"),

  phone: phoneSchema.optional(),

  password: z.string({
    required_error: "Password is required"
  })
    .min(8, "Password must contain at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
    .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
    .refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
    .refine((val) => /[^A-Za-z0-9]/.test(val), "Password must contain at least one special character"),

  confirmPassword: z.string({
    required_error: "Confirm password is required"
  }),

  // Client cannot set arbitrary roles (defaults to candidate)
  role: z.string().optional().transform(() => "candidate"),

  termsAccepted: z.boolean({
    required_error: "You must accept the terms and conditions"
  }).refine((val) => val === true, "You must accept the terms and conditions")
}).strict("Unknown fields are not allowed")
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required"
  }).trim().toLowerCase().email("Please enter a valid email address").max(254),
  password: z.string({
    required_error: "Password is required"
  }).min(1, "Password cannot be empty").max(128)
}).strict("Unknown fields are not allowed");

const sendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address").optional(),
  phone: phoneSchema.optional(),
  purpose: z.enum(["register", "login", "forgot-password", "verify-email"], {
    errorMap: () => ({ message: "Purpose must be register, login, forgot-password, or verify-email" })
  })
}).strict("Unknown fields are not allowed")
.refine((data) => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"]
});

const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email("Please enter a valid email address").optional(),
  phone: phoneSchema.optional(),
  otp: z.string({
    required_error: "OTP is required"
  }).regex(/^\d{6}$/, "OTP must be exactly 6 digits")
}).strict("Unknown fields are not allowed")
.refine((data) => data.email || data.phone, {
  message: "Either email or phone is required",
  path: ["email"]
});

const forgotPasswordSchema = z.object({
  email: z.string({
    required_error: "Email is required"
  }).trim().toLowerCase().email("Please enter a valid email address")
}).strict("Unknown fields are not allowed");

const resetPasswordSchema = z.object({
  token: z.string({
    required_error: "Reset token is required"
  }),
  password: z.string({
    required_error: "New password is required"
  })
    .min(8, "Password must contain at least 8 characters")
    .max(128, "Password cannot exceed 128 characters")
    .refine((val) => /[A-Z]/.test(val), "Password must contain at least one uppercase letter")
    .refine((val) => /[a-z]/.test(val), "Password must contain at least one lowercase letter")
    .refine((val) => /[0-9]/.test(val), "Password must contain at least one number")
    .refine((val) => /[^A-Za-z0-9]/.test(val), "Password must contain at least one special character"),
  confirmPassword: z.string({
    required_error: "Confirm password is required"
  })
}).strict("Unknown fields are not allowed")
.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

module.exports = {
  registerSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
