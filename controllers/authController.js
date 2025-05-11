const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

// @desc    Register a new user
// @route   POST /api/signup
// @access  Public
const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.render('Signup', { error: 'Please provide all required fields' });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.render('Signup', { error: 'User already exists' });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isActive: true
    });
    
    if (user) {
      // Generate token
      const token = generateToken(user._id);
      
      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });
      
      return res.render('Signup', { success: true });
    } else {
      return res.render('Signup', { error: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return res.render('Signup', { 
      error: error.message || 'An error occurred during signup'
    });
  }
};

// @desc    Login user
// @route   POST /api/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.render('Login', { error: 'Please provide email and password' });
    }
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.render('Login', { error: 'Invalid email or password' });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.render('Login', { error: 'Your account has been deactivated' });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.render('Login', { error: 'Invalid email or password' });
    }
    
    // Update last login
    await user.updateLastLogin();
    
    // Generate token
    const token = generateToken(user._id);
    
    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    
    // Redirect to dashboard
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    return res.render('Login', { 
      error: error.message || 'An error occurred during login'
    });
  }
};

// @desc    Get dashboard
// @route   GET /dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = req.user;
    
    if (!user.isActive) {
      return res.redirect('/login');
    }
    
    // Render dashboard with user data
    return res.render('Dashboard', { 
      user: {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      } 
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.redirect('/login');
  }
};

// @desc    Logout user
// @route   GET /api/logout
// @access  Private
const logoutUser = (req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0)
    });
    
    return res.redirect('/');
  } catch (error) {
    console.error('Logout error:', error);
    return res.redirect('/');
  }
};

module.exports = {
  signupUser,
  loginUser,
  getDashboard,
  logoutUser
}; 