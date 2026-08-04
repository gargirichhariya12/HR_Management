const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requiring role [${allowedRoles.join(', ')}], but current user role is '${req.user.role}'.`
      });
    }

    next();
  };
};

module.exports = roleCheck;
