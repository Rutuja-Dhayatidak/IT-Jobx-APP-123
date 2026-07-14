/**
 * SECURITY WARNING:
 * react-native-config, Expo environment variables, Gradle variables, and bundled .env values 
 * do NOT make private secrets secure! Mobile app bundles can be reverse-engineered, 
 * and any values present in the bundle can be extracted. 
 * 
 * Never store private API keys, database credentials, or private service credentials in this file 
 * or anywhere in the mobile codebase. Use backend proxy architectures instead.
 */
declare const process: { env: { NODE_ENV?: string } };

export interface AppConfig {
  APP_ENV: "development" | "staging" | "production";
  API_BASE_URL: string;
  PUBLIC_RAZORPAY_KEY_ID?: string;
  PUBLIC_FIREBASE_CONFIG?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  SENTRY_DSN?: string;
}

const DEV_CONFIG: AppConfig = {
  APP_ENV: "development",
  API_BASE_URL: "http://localhost:5001/api", // Maps through adb reverse
  PUBLIC_RAZORPAY_KEY_ID: "rzp_test_SNw35MkokY8h1y",
};

const STAGING_CONFIG: AppConfig = {
  APP_ENV: "staging",
  API_BASE_URL: "https://staging-api.itjobx.com/api",
  PUBLIC_RAZORPAY_KEY_ID: "rzp_test_SNw35MkokY8h1y",
};

const PROD_CONFIG: AppConfig = {
  APP_ENV: "production",
  API_BASE_URL: "https://api.itjobx.com/api",
  PUBLIC_RAZORPAY_KEY_ID: "rzp_live_XXXXXXXXXXXXXX",
};

// Select configuration based on process.env.NODE_ENV or bundled environments
const getEnvConfig = (): AppConfig => {
  // If NODE_ENV is set to production during build, use production values
  const currentEnv = process.env.NODE_ENV === "production" ? "production" : "development";
  
  switch (currentEnv) {
    case "production":
      return PROD_CONFIG;
    default:
      return DEV_CONFIG;
  }
};

export const Config = getEnvConfig();
