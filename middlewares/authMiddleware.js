const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

exports.requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization; // "Bearer token" 
  if (!authHeader || !authHeader.startsWith('Bearer ')) { //the token should start with Bearer
    return res.status(401).json({ message: 'Not authorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;  //decode the token and attach user info to req object
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' }); //check if user role is allowed if he's not an admin then the access is forbidden
    }
    next();
  };
};
