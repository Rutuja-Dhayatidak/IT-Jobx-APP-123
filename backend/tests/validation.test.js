const { registerSchema } = require("../src/validations/auth.validation");
const { updateProfileSchema } = require("../src/validations/user.validation");
const { createJobSchema } = require("../src/validations/job.validation");
const { sanitize } = require("../src/utils/sanitizeInput");

describe("Input Validation and Sanitization Test Suite", () => {
  
  describe("Registration Schema", () => {
    test("Should pass validation with a valid registration payload", () => {
      const payload = {
        firstName: "Rutuja",
        lastName: "Dhayatidak",
        email: "rutuja@example.com",
        password: "SecurePassword@123",
        confirmPassword: "SecurePassword@123",
        termsAccepted: true
      };
      
      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.role).toBe("candidate"); // Default role override
      }
    });

    test("Should reject invalid email addresses", () => {
      const payload = {
        firstName: "Rutuja",
        email: "invalid-email-address",
        password: "SecurePassword@123",
        confirmPassword: "SecurePassword@123",
        termsAccepted: true
      };
      
      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });

    test("Should reject weak passwords (missing uppercase, number, or special char)", () => {
      const payload = {
        firstName: "Rutuja",
        email: "rutuja@example.com",
        password: "weakpassword",
        confirmPassword: "weakpassword",
        termsAccepted: true
      };
      
      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });

    test("Should reject password mismatch", () => {
      const payload = {
        firstName: "Rutuja",
        email: "rutuja@example.com",
        password: "SecurePassword@123",
        confirmPassword: "DifferentPassword@123",
        termsAccepted: true
      };
      
      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });

    test("Should override custom role inputs with default 'candidate'", () => {
      const payload = {
        firstName: "Rutuja",
        email: "rutuja@example.com",
        password: "SecurePassword@123",
        confirmPassword: "SecurePassword@123",
        role: "admin", // Attempt to inject admin role
        termsAccepted: true
      };
      
      const parsed = registerSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.role).toBe("candidate");
      }
    });
  });

  describe("Sanitization and NoSQL Injection Prevention", () => {
    test("Should sanitize script tags to prevent XSS", () => {
      const input = "<script>alert('XSS')</script>Hello World";
      const output = sanitize(input);
      expect(output).toBe("Hello World");
    });

    test("Should strip keys starting with $ to prevent NoSQL injection", () => {
      const input = {
        email: { "$ne": null },
        password: "password123"
      };
      const output = sanitize(input);
      expect(output.email.$ne).toBeUndefined();
      expect(output.password).toBe("password123");
    });

    test("Should prevent prototype pollution", () => {
      const input = JSON.parse('{"__proto__": {"polluted": true}, "name": "test"}');
      const output = sanitize(input);
      expect(output.polluted).toBeUndefined();
      expect(Object.prototype.polluted).toBeUndefined();
      expect(output.name).toBe("test");
    });
  });

  describe("Profile Update Schema", () => {
    test("Should reject negative total experience", () => {
      const payload = {
        experience: -5
      };
      const parsed = updateProfileSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });

    test("Should reject experience greater than realistic range", () => {
      const payload = {
        experience: 120
      };
      const parsed = updateProfileSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });
  });

  describe("Job Creation Schema", () => {
    test("Should reject job if maximum salary is less than minimum salary", () => {
      const payload = {
        title: "Software Engineer",
        companyName: "ITJobX",
        description: "Must have at least 50 characters of description in order to pass the validation constraints of the schema.",
        employmentType: "full-time",
        workMode: "remote",
        minExperience: 2,
        maxExperience: 5,
        minSalary: 100000,
        maxSalary: 50000, // Less than min
        skillsRequired: ["Node.js"],
        deadline: new Date(Date.now() + 86400000).toISOString()
      };
      const parsed = createJobSchema.safeParse(payload);
      expect(parsed.success).toBe(false);
    });
  });

});
