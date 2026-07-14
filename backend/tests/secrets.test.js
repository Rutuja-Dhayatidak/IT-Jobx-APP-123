const { redact } = require("../src/utils/secretRedaction");
const tokenService = require("../src/services/token.service");

describe("Secrets and Environment Validation Tests", () => {
  let mockExit;

  beforeAll(() => {
    mockExit = jest.spyOn(process, "exit").mockImplementation((code) => {
      throw new Error(`process.exit called with ${code}`);
    });
  });

  afterAll(() => {
    mockExit.mockRestore();
  });

  afterEach(() => {
    jest.resetModules();
  });

  test("Should redact sensitive keys in logs", () => {
    const input = {
      password: "my-secret-password",
      token: "secretToken123",
      email: "user@example.com",
      authorization: "Bearer xxxxxxx"
    };

    const output = redact(input);
    expect(output.password).toBe("********");
    expect(output.token).toBe("********");
    expect(output.authorization).toBe("********");
    expect(output.email).toBe("user@example.com"); // Non-sensitive key left intact
  });

  test("Should fail Zod validation if required env variables are missing", () => {
    const originalUri = process.env.MONGO_URI;
    delete process.env.MONGO_URI;
    process.env.BYPASS_TEST_DEFAULTS = "true";

    expect(() => {
      jest.isolateModules(() => {
        require("../src/config/env.config");
      });
    }).toThrow(/process.exit called with 1/);

    process.env.MONGO_URI = originalUri;
    delete process.env.BYPASS_TEST_DEFAULTS;
  });

  test("Should reject weak JWT secrets in production", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalJwtSecret = process.env.JWT_SECRET;
    
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "secret"; // Weak placeholder

    expect(() => {
      // Re-evaluate config validation
      jest.isolateModules(() => {
        require("../src/config/env.config");
      });
    }).toThrow(/process.exit called with 1/);

    process.env.NODE_ENV = originalNodeEnv;
    process.env.JWT_SECRET = originalJwtSecret;
  });

  test("Should reject same access and refresh secret", () => {
    const originalJwtSecret = process.env.JWT_SECRET;
    const originalJwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

    process.env.JWT_SECRET = "this-is-a-long-enough-secret-key-32-chars";
    process.env.JWT_REFRESH_SECRET = "this-is-a-long-enough-secret-key-32-chars";

    expect(() => {
      jest.isolateModules(() => {
        require("../src/config/env.config");
      });
    }).toThrow(/process.exit called with 1/);

    process.env.JWT_SECRET = originalJwtSecret;
    process.env.JWT_REFRESH_SECRET = originalJwtRefreshSecret;
  });
});
