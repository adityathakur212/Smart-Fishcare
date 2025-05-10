const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  
  // Get token from cookie or authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.redirect('/login');
  }
  
  try {
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.redirect('/login');
    }
    
    // Find user by id and attach to request object
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.redirect('/login');
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.redirect('/login');
  }
};

module.exports = { protect }; 