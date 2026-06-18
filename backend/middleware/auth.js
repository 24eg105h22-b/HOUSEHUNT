const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token && req.cookies && req.cookies.token) token = req.cookies.token
  if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin access required' });
};

const ownerOnly = (req, res, next) => {
  if (!req.user) return res.status(403).json({ message: 'Owner access required' });
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'owner') {
    if (req.user.verified) return next();
    return res.status(403).json({ message: 'Owner account not yet verified' });
  }
  return res.status(403).json({ message: 'Owner access required' });
};

module.exports = { protect, adminOnly, ownerOnly };
