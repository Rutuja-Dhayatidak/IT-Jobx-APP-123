const { z } = require("zod");

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, {
  message: "Invalid resource identifier."
});

module.exports = {
  objectIdSchema
};
