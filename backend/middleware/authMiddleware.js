const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'notably_super_secret_key_123';

const authMiddleware = (req, res, next) => {
  // Grab token from the Authorization header
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied.' });
  }

  try {
    // Extract token string after "Bearer "
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach decoded user information directly into the request payload
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired.' });
  }
};

module.exports = authMiddleware;