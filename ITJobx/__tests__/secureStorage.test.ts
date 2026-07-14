import { secureStorageService } from "../src/services/secureStorage.service";
import { authTokenService } from "../src/services/authToken.service";
import { Config } from "../src/config/app.config";

describe("Mobile Secure Storage & Configuration Validation Tests", () => {
  beforeEach(async () => {
    await authTokenService.clearAllTokens();
  });

  test("Should store and retrieve access token securely", async () => {
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9";
    await authTokenService.saveAccessToken(mockToken);
    
    const retrievedToken = await authTokenService.getAccessToken();
    expect(retrievedToken).toBe(mockToken);
  });

  test("Should clear all tokens on logout", async () => {
    const mockAccessToken = "access-token-123";
    const mockRefreshToken = "refresh-token-456";

    await authTokenService.saveAccessToken(mockAccessToken);
    await authTokenService.saveRefreshToken(mockRefreshToken);

    // Validate they are set
    expect(await authTokenService.getAccessToken()).toBe(mockAccessToken);
    expect(await authTokenService.getRefreshToken()).toBe(mockRefreshToken);

    // Clear tokens
    await authTokenService.clearAllTokens();

    // Validate they are cleared
    expect(await authTokenService.getAccessToken()).toBeNull();
    expect(await authTokenService.getRefreshToken()).toBeNull();
  });

  test("Should not contain private secrets in public Config", () => {
    const keys = Object.keys(Config);
    
    // Explicitly check that MongoDB URI, JWT Access Secret, Cloudinary API secret etc. are absent
    const privateKeys = [
      "MONGODB_URI",
      "JWT_ACCESS_SECRET",
      "JWT_REFRESH_SECRET",
      "SMTP_PASSWORD",
      "CLOUDINARY_API_SECRET",
      "RAZORPAY_KEY_SECRET",
      "FIREBASE_PRIVATE_KEY",
      "AWS_SECRET_ACCESS_KEY"
    ];

    privateKeys.forEach(privateKey => {
      expect(keys).not.toContain(privateKey);
      expect((Config as any)[privateKey]).toBeUndefined();
    });
  });
});
