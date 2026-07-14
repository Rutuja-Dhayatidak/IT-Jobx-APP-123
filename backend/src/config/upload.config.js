const multer = require("multer");

const memoryStorage = multer.memoryStorage();

// Custom limits configuration to prevent DoS attacks via multipart/form-data
const uploadConfig = {
  storage: memoryStorage,
  limits: {
    fields: 10,             // Max non-file fields
    fieldNameSize: 100,     // Max field name size in bytes
    fieldSize: 100 * 1024,  // Max field value size (100KB)
    files: 1,               // Max number of files allowed
    fileSize: 20 * 1024 * 1024 // Default fallback to 20MB max
  }
};

const secureMulter = multer(uploadConfig);

module.exports = {
  secureMulter
};
