const adminOnly = (req, res, next) => {
  if (!req.user || req.user.is_admin !== 1) {
    return res.status(403).json({ error: 'Not authorized - admin only' });
  }
  next();
};

module.exports = adminOnly;
