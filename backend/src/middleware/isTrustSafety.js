const isTrustSafety = (req, res, next) => {
  const allowedRoles = ["Trust & Safety", "superAdmin", "SUPER_ADMIN", "trust_safety"];
  
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ 
      message: "Access denied. Trust & Safety or Super Admin role required.",
      currentRole: req.user?.role
    });
  }
};

module.exports = isTrustSafety;
