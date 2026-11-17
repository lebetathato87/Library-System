const { verifyToken } = require('../utils/token');

/** Requires a valid "Authorization: Bearer <token>" header. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const data = verifyToken(header.replace('Bearer ', ''));
  if (!data) return res.status(401).json({ error: 'Please log in to continue' });
  req.user = data;
  next();
}

/** Must be used after requireAuth. */
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
