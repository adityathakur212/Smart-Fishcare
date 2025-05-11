const jwt = require('jsonwebtoken');

// Secret key for JWT (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET || 'smartfishcaresecret2024!@#$%^&*()';

// Generate JWT token
const generateToken = (userId) => {
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
    algorithm: 'HS256'
  });
};

// Verify JWT token
const verifyToken = (token) => {
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
}; 