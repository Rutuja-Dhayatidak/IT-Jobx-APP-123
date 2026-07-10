const isFinanceAdmin = (req, res, next) => {
  const allowedRoles = ["Finance Admin", "superAdmin", "SUPER_ADMIN", "finance_admin"];
  
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ 
      message: "Access denied. Finance Admin or Super Admin role required.",
      currentRole: req.user?.role
    });
  }
};

module.exports = isFinanceAdmin;
