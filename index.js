const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require('cookie-parser');
const { connectDB, getConnectionStatus } = require('./config/db');
require('dotenv').config();

// Middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Sensor data storage
let latestData = {
  temperature: '24°C',
  pH: '7.1',
  waterLevel: '75%',
  feedingAgo: '2h ago'
};

// API routes for sensor data
app.post('/api/data', (req, res) => {
  latestData = req.body;
  console.log('New sensor data:', latestData);
  res.sendStatus(200);
});

app.get('/api/data', (req, res) => {
  res.json(latestData);
});

// Basic routes
app.get("/", (req, res) => {
  res.render("Home", { dbConnected: getConnectionStatus() });
});

app.get("/login", (req, res) => {
  res.render("Login", { dbConnected: getConnectionStatus() });
});

app.get("/signup", (req, res) => {
  res.render("Signup", { dbConnected: getConnectionStatus() });
});

app.get("/dashboard", (req, res) => {
  const mockUser = {
    name: "Aditya Thakur",
    email: "akthakur1598@gmail.com",
    createdAt: new Date()
  };
  res.render("Dashboard", { user: mockUser, sensor: latestData });
});

// Initialize the server
async function startServer() {
  try {
    // Try to connect to MongoDB
    const dbConnected = await connectDB();
    
    // If MongoDB is connected, include database-dependent routes
    if (dbConnected) {
      const User = require('./models/User');
      const authRoutes = require('./routes/authRoutes');
      
      // Database-dependent routes
      app.use('/', authRoutes);
      
      // Delete route - depends on database
      app.get("/delete/:id", async (req, res) => {
        try {
          const emailToDelete = req.params.id;
          console.log(`Attempting to delete user with email: ${emailToDelete}`);
          
          const deletedUser = await User.findOneAndDelete({ email: emailToDelete });
          
          if (!deletedUser) {
            console.log(`No user found with email: ${emailToDelete}`);
            return res.status(404).render("Login", { error: "User not found" });
          }
          
          console.log(`Successfully deleted user: ${deletedUser.email}`);
          res.render("Login", { message: "Your account has been deleted successfully" });
        } catch (error) {
          console.error("Error deleting account:", error);
          res.render("Login", { error: "An error occurred while deleting your account" });
        }
      });
    } else {
      console.log("Running without database-dependent features");
      
      // Fallback routes for when database is not available
      app.post('/api/signup', (req, res) => {
        res.render('Signup', { error: 'Database connection is unavailable. Cannot register at this time.' });
      });
      
      app.post('/api/login', (req, res) => {
        res.render('Login', { error: 'Database connection is unavailable. Using demo mode.' });
      });
    }
    
    // Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Database connected: ${getConnectionStatus()}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
