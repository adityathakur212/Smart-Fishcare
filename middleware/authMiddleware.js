const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  try {
    // Get token from cookie or authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      console.log('No token found');
      return res.redirect('/login');
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded || !decoded.id) {
      console.log('Invalid token');
      return res.redirect('/login');
    }
    
    // Find user by id and attach to request object
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found');
      return res.redirect('/login');
    }
    
    // Check if user is still active
    if (!user.isActive) {
      console.log('User account is inactive');
      return res.redirect('/login');
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.redirect('/login');
  }
};

module.exports = { protect }; 