import { z } from "zod";

// Shared frontend Login Schema
export const loginFormSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(254, "Email cannot exceed 254 characters"),
  
  password: z.string()
    .min(8, "Password must contain at least 8 characters")
    .max(128)
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
