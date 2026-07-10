const isPlatformAdmin = (req, res, next) => {
  if (req.user && req.user.role === "Platform Admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Platform Admin only." });
  }
};

module.exports = isPlatformAdmin;
