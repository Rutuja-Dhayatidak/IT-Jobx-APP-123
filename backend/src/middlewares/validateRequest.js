const { z } = require("zod");

/**
 * Reusable validation middleware.
 * Supports passing a Zod schema directly (defaults to validating req.body)
 * or passing an object containing { body, query, params } schemas.
 */
const validateRequest = (schemaOrObject) => {
  return async (req, res, next) => {
    try {
      // 1. If it's a direct Zod schema, validate req.body
      if (schemaOrObject instanceof z.ZodType) {
        req.body = await schemaOrObject.parseAsync(req.body);
      } else {
        // 2. If it's an object containing body, query, or params schemas
        if (schemaOrObject.body) {
          req.body = await schemaOrObject.body.parseAsync(req.body);
        }
        if (schemaOrObject.query) {
          req.query = await schemaOrObject.query.parseAsync(req.query);
        }
        if (schemaOrObject.params) {
          req.params = await schemaOrObject.params.parseAsync(req.params);
        }
      }
      next();
    } catch (error) {
      if (error.errors || error.issues) {
        const issues = error.errors || error.issues || [];
        const formattedErrors = issues.map((err) => ({
          field: err.path.join("."),
          message: err.message
        }));

        return res.status(422).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors
        });
      }
      next(error);
    }
  };
};

module.exports = validateRequest;
