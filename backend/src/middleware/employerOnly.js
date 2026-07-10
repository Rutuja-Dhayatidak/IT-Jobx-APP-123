const employerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'employer') {
    next();
  } else {
    return res.status(403).json({ message: "Employer access only" });
  }
};

module.exports = employerOnly;
