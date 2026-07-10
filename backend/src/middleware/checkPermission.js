const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    // RBAC has been disabled as per requirements, allow all requests to pass through
    return next();
  };
};

module.exports = checkPermission;
