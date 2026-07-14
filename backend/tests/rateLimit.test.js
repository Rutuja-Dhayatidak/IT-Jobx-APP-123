const { getLimiterKey, getClientIp } = require("../src/utils/rateLimitKeyGenerator");
const globalRateLimiter = require("../src/middlewares/globalRateLimiter");
const loginRateLimiter = require("../src/middlewares/loginRateLimiter");
const { otpSendRateLimiter, otpVerifyRateLimiter } = require("../src/middlewares/otpRateLimiter");
const registerRateLimiter = require("../src/middlewares/registerRateLimiter");
const jobRateLimiter = require("../src/middlewares/jobRateLimiter");
const {
  globalRateLimiterStore,
  loginRateLimiterStore,
  otpSendRateLimiterStore,
  otpCooldownLimiterStore,
  otpVerifyRateLimiterStore,
  registerRateLimiterStore,
  jobApiRateLimiterStore
} = require("../src/config/rateLimiter.config");

// Helper to mock Express req, res, next objects
function mockRequestResponse(reqBody = {}, headers = {}, params = {}) {
  const req = {
    ip: "12.34.56.78",
    body: reqBody,
    headers: headers,
    params: params,
    connection: { remoteAddress: "12.34.56.78" },
    path: "/api/test-route",
    method: "POST"
  };
  
  const res = {
    statusCode: 200,
    headersSent: false,
    headerMap: {},
    set(name, value) {
      this.headerMap[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  
  const next = jest.fn();
  return { req, res, next };
}

describe("API Rate Limiting Test Suite", () => {
  beforeEach(async () => {
    // Reset memory stores between tests
    await globalRateLimiterStore.delete("12.34.56.78");
    await loginRateLimiterStore.delete("12.34.56.78_test@example.com");
    await otpSendRateLimiterStore.delete("12.34.56.78_test@example.com");
    await otpCooldownLimiterStore.delete("12.34.56.78_test@example.com");
    await otpVerifyRateLimiterStore.delete("12.34.56.78_test@example.com");
    await registerRateLimiterStore.delete("12.34.56.78");
    await jobApiRateLimiterStore.delete("12.34.56.78");
    await jobApiRateLimiterStore.delete("user_999");
  });

  describe("Key Generator and IP Normalization", () => {
    test("Should parse loopback and ipv6 mapped loopback IP to local ipv4", () => {
      const req = { ip: "::1", connection: {} };
      expect(getClientIp(req)).toBe("127.0.0.1");

      const reqMapped = { ip: "::ffff:127.0.0.1", connection: {} };
      expect(getClientIp(reqMapped)).toBe("127.0.0.1");
    });

    test("Should clean and normalize email keys", () => {
      const req = { ip: "192.168.1.1", connection: {} };
      const key = getLimiterKey(req, "  TestEmail@EXAMPLE.com  ");
      expect(key).toBe("192.168.1.1_testemail@example.com");
    });
  });

  describe("Global Rate Limiter Middleware", () => {
    test("Should allow requests under the limit and set rate limit headers", async () => {
      const { req, res, next } = mockRequestResponse();
      await globalRateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(res.headerMap["X-RateLimit-Limit"]).toBeDefined();
      expect(res.headerMap["X-RateLimit-Remaining"]).toBeDefined();
    });

    test("Should return 429 and Retry-After header when limit exceeded", async () => {
      const { req, res, next } = mockRequestResponse();
      
      // Consume all points
      for (let i = 0; i < globalRateLimiterStore.points; i++) {
        await globalRateLimiterStore.consume(req.ip);
      }

      await globalRateLimiter(req, res, next);
      expect(res.statusCode).toBe(429);
      expect(res.headerMap["Retry-After"]).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Too many requests");
    });
  });

  describe("Login Failed Attempt Rate Limiter", () => {
    test("Should consume failed login attempt and reset on success", async () => {
      const { req, res, next } = mockRequestResponse({ email: "test@example.com" });
      
      // Simulate calling the endpoint first to initiate res.json wrapper
      await loginRateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();

      // Trigger failed attempt (status 401)
      res.status(401).json({ error: "Invalid credentials" });
      
      const resStore = await loginRateLimiterStore.get("12.34.56.78_test@example.com");
      expect(resStore.consumedPoints).toBe(1);

      // Trigger success login (status 200) -> should reset points
      const { req: req2, res: res2, next: next2 } = mockRequestResponse({ email: "test@example.com" });
      await loginRateLimiter(req2, res2, next2);
      res2.status(200).json({ token: "jwt_token" });

      const resStoreAfter = await loginRateLimiterStore.get("12.34.56.78_test@example.com");
      expect(resStoreAfter).toBeNull();
    });
  });

  describe("OTP Rate Limiting and Cooldown", () => {
    test("Should enforce 60 seconds cooldown between consecutive requests", async () => {
      const { req, res, next } = mockRequestResponse({ email: "test@example.com" });
      await otpSendRateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();

      // Second request immediately after should be blocked by cooldown
      const { req: req2, res: res2, next: next2 } = mockRequestResponse({ email: "test@example.com" });
      await otpSendRateLimiter(req2, res2, next2);
      expect(res2.statusCode).toBe(429);
      expect(res2.body.message).toContain("Please wait");
      expect(res2.headerMap["Retry-After"]).toBeDefined();
    });
  });

  describe("Job Search Rate Limiter", () => {
    test("Should key on User ID if user is authenticated", async () => {
      const { req, res, next } = mockRequestResponse();
      req.user = { id: "999" }; // Authenticated user
      
      await jobRateLimiter(req, res, next);
      expect(next).toHaveBeenCalled();

      const resStore = await jobApiRateLimiterStore.get("user_999");
      expect(resStore.consumedPoints).toBe(1);
    });
  });
});
