const { z } = require("zod");

const safeUrlSchema = z.string().url("Must be a valid URL").refine((val) => {
  return val.startsWith("https://") && !val.includes("javascript:") && !val.includes("data:");
}, "Must be a secure HTTPS URL");

const linkedinUrlSchema = safeUrlSchema.refine((val) => val.includes("linkedin.com"), "Must be a valid LinkedIn profile URL");
const githubUrlSchema = safeUrlSchema.refine((val) => val.includes("github.com"), "Must be a valid GitHub profile URL");

const skillsSchema = z.preprocess((val) => {
  if (!Array.isArray(val)) return val;
  const cleaned = val.map(s => (typeof s === "string" ? s.trim() : s)).filter(s => typeof s === "string" && s.length > 0);
  const seen = new Set();
  const unique = [];
  for (const s of cleaned) {
    const lower = s.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      unique.push(s);
    }
  }
  return unique;
}, z.array(z.string().min(2, "Each skill must be 2-40 characters").max(40)).max(30, "Maximum of 30 skills allowed"));

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(60).optional(),
  firstName: z.string().trim().min(2).max(60).optional(),
  lastName: z.string().trim().max(60).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
  mobile: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  location: z.string().trim().max(100).optional(),
  preferredLocations: z.array(z.string().trim().max(50)).max(10).optional(),
  experience: z.union([
    z.number(),
    z.array(
      z.object({
        company: z.string().trim().max(100).optional(),
        role: z.string().trim().max(100).optional(),
        duration: z.string().trim().max(100).optional(),
        responsibilities: z.string().trim().max(2000).optional()
      })
    )
  ]).optional(),
  skills: skillsSchema.optional(),
  education: z.array(
    z.object({
      college: z.string().trim().min(2).max(150).optional(),
      degree: z.string().trim().min(2).max(150).optional(),
      year: z.string().trim().max(100).optional()
    })
  ).optional(),
  profileImage: z.string().trim().optional(),
  profileImagePublicId: z.string().trim().optional(),
  resumeUrl: z.string().trim().optional().or(z.literal("")),
  resumePublicId: z.string().trim().optional(),
  linkedinUrl: linkedinUrlSchema.optional().or(z.literal("")),
  githubUrl: githubUrlSchema.optional().or(z.literal("")),
  portfolioUrl: safeUrlSchema.optional().or(z.literal("")),
  headline: z.string().trim().max(200).optional(),
  position: z.string().trim().max(150).optional(),
  about: z.string().trim().max(2000).optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say", ""]).optional(),
  preferredRoles: z.array(z.string().trim().max(100)).max(20).optional(),
  preferredJobType: z.string().trim().max(50).optional(),
  job_preferences: z.object({
    role: z.string().trim().max(100).optional(),
    location: z.string().trim().max(100).optional(),
    type: z.string().trim().max(50).optional(),
    salary: z.string().trim().max(50).optional(),
  }).optional(),
  languages: z.array(z.string().trim().max(50)).max(30).optional(),
  dob: z.union([z.string(), z.date()]).optional(),
  projects: z.array(
    z.object({
      title: z.string().trim().max(150).optional(),
      description: z.string().trim().max(2000).optional(),
      link: z.string().trim().max(500).optional(),
    })
  ).optional(),
  internships: z.array(
    z.object({
      company: z.string().trim().max(150).optional(),
      role: z.string().trim().max(150).optional(),
      duration: z.string().trim().max(100).optional(),
    })
  ).optional(),
  certifications: z.array(
    z.object({
      name: z.string().trim().max(150).optional(),
      organization: z.string().trim().max(150).optional(),
      issueDate: z.string().trim().optional(),
      expiryDate: z.string().trim().optional(),
      noExpiry: z.boolean().optional(),
      credentialId: z.string().trim().optional(),
      credentialUrl: z.string().trim().optional(),
      credentialUrl2: z.string().trim().optional(),
    })
  ).optional(),
  volunteer: z.array(
    z.object({
      title: z.string().trim().max(150).optional(),
      organization: z.string().trim().max(150).optional(),
      role: z.string().trim().max(150).optional(),
      duration: z.string().trim().max(100).optional(),
      description: z.string().trim().max(2000).optional(),
      website: z.string().trim().max(500).optional(),
    })
  ).optional(),
  awards: z.array(
    z.object({
      title: z.string().trim().max(150).optional(),
      organization: z.string().trim().max(150).optional(),
      dateAwarded: z.string().trim().optional(),
      description: z.string().trim().max(2000).optional(),
    })
  ).optional(),
}).strict("Unknown fields are not allowed");

module.exports = {
  updateProfileSchema
};
