const { redact } = require("./secretRedaction");
const env = require("../config/env.config");

const logger = {
  info: (...args) => {
    if (env.NODE_ENV !== "test") {
      const sanitizedArgs = args.map(arg => redact(arg));
      console.log(`[INFO] [${new Date().toISOString()}]:`, ...sanitizedArgs);
    }
  },
  warn: (...args) => {
    if (env.NODE_ENV !== "test") {
      const sanitizedArgs = args.map(arg => redact(arg));
      console.warn(`[WARN] [${new Date().toISOString()}]:`, ...sanitizedArgs);
    }
  },
  error: (...args) => {
    if (env.NODE_ENV !== "test") {
      const sanitizedArgs = args.map(arg => redact(arg));
      console.error(`[ERROR] [${new Date().toISOString()}]:`, ...sanitizedArgs);
    }
  },
  debug: (...args) => {
    if (env.NODE_ENV === "development") {
      const sanitizedArgs = args.map(arg => redact(arg));
      console.log(`[DEBUG] [${new Date().toISOString()}]:`, ...sanitizedArgs);
    }
  }
};

module.exports = logger;
