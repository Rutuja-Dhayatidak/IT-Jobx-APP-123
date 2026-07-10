exports.isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === "superAdmin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Super Admin only." });
  }
};
