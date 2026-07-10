const memoryCache = new Map();
const memoryExpiry = new Map();
const rateLimitCache = new Map();

// Automatic cleanup of expired memory cache entries
setInterval(() => {
  const now = Date.now();
  for (const [key, expiry] of memoryExpiry.entries()) {
    if (now > expiry) {
      memoryCache.delete(key);
      memoryExpiry.delete(key);
    }
  }
}, 10000);

let client = null;
let isRedisConnected = false;

// Attempt to initialize real Redis if environment configurations exist
if (process.env.REDIS_URL) {
  try {
    const Redis = require('ioredis');
    client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: () => null // Do not keep trying if connection fails
    });
    client.on('connect', () => {
      isRedisConnected = true;
      console.log('Redis connected successfully 🔋');
    });
    client.on('error', (err) => {
      isRedisConnected = false;
      console.warn('Redis connection failed, using memory fallback 📭', err.message);
    });
  } catch (err) {
    console.warn('ioredis package not found, using memory fallback 📭');
  }
}

const get = async (key) => {
  if (isRedisConnected && client) {
    try {
      return await client.get(key);
    } catch (e) {
      // Fallback on error
    }
  }
  const now = Date.now();
  if (memoryExpiry.has(key) && now > memoryExpiry.get(key)) {
    memoryCache.delete(key);
    memoryExpiry.delete(key);
    return null;
  }
  return memoryCache.get(key) || null;
};

const set = async (key, value, ttl = 300) => {
  if (isRedisConnected && client) {
    try {
      await client.set(key, value, 'EX', ttl);
      return;
    } catch (e) {
      // Fallback
    }
  }
  memoryCache.set(key, value);
  memoryExpiry.set(key, Date.now() + ttl * 1000);
};

const del = async (key) => {
  if (isRedisConnected && client) {
    try {
      await client.del(key);
      return;
    } catch (e) {
      // Fallback
    }
  }
  memoryCache.delete(key);
  memoryExpiry.delete(key);
};

/**
 * Custom rate limiter utility
 * Returns true if allowed, false if limit exceeded
 */
const rateLimit = async (key, limit = 20, windowSeconds = 3600) => {
  if (isRedisConnected && client) {
    try {
      const current = await client.incr(key);
      if (current === 1) {
        await client.expire(key, windowSeconds);
      }
      return current <= limit;
    } catch (e) {
      // Fallback
    }
  }
  
  const now = Date.now();
  const record = rateLimitCache.get(key) || { count: 0, resetTime: now + windowSeconds * 1000 };
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowSeconds * 1000;
  } else {
    record.count += 1;
  }
  
  rateLimitCache.set(key, record);
  return record.count <= limit;
};

module.exports = {
  get,
  set,
  del,
  rateLimit,
  isRedisConnected: () => isRedisConnected,
  client
};
