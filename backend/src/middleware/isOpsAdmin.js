const isOpsAdmin = (req, res, next) => {
  const allowedRoles = ["OPS Admin", "Ops Admin", "superAdmin", "SUPER_ADMIN", "ops_admin"];
  
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ 
      message: "Access denied. OPS Admin or Super Admin role required.",
      currentRole: req.user?.role
    });
  }
};


module.exports = isOpsAdmin;
