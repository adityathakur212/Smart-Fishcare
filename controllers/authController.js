const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

// @desc    Register a new user
// @route   POST /api/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.render('Signup', { error: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password
    });
    
    if (user) {
      // Generate token
      const token = generateToken(user._id);
      
      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      return res.render('Signup', { success: true });
    } else {
      return res.render('Signup', { error: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    return res.render('Signup', { error: 'An error occurred' });
  }
};

// @desc    Login user
// @route   POST /api/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.render('Login', { error: 'Invalid email or password' });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.render('Login', { error: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    // Redirect to dashboard
    return res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    return res.render('Login', { error: 'An error occurred' });
  }
};

// @desc    Get dashboard
// @route   GET /dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = req.user;
    
    // Render dashboard with user data
    return res.render('Dashboard', { 
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      } 
    });
  } catch (error) {
    console.error(error);
    return res.redirect('/login');
  }
};

// @desc    Logout user
// @route   GET /api/logout
// @access  Private
const logoutUser = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  return res.redirect('/');
};

module.exports = {
  signupUser,
  loginUser,
  getDashboard,
  logoutUser
}; 