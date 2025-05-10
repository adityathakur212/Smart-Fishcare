const express = require('express');
const router = express.Router();
const { 
  signupUser, 
  loginUser, 
  getDashboard, 
  logoutUser 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Auth routes
router.post('/api/signup', signupUser);
router.post('/api/login', loginUser);
router.get('/api/logout', logoutUser);

// Protected routes
router.get('/dashboard', protect, getDashboard);

module.exports = router; 