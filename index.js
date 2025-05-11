const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
require('dotenv').config();

// Middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// In-memory Sensor Data Storage
let latestData = {
  temperature: "24°C",
  distance: "100",
  waterLevel: "85%",
  feedingAgo: "2h ago",
  lastFeedingTime: null,
  feedingStatus: "Idle"
};

let feedingRequestTime = 0; // Seconds to be fetched by ESP32

// ===== ✅ API to RECEIVE sensor data from ESP32 =====
app.post('/api/data', (req, res) => {
  const { temperature, distance, feedingStatus } = req.body;

  if (temperature) latestData.temperature = temperature;
  if (distance) latestData.distance = distance;
  if (feedingStatus) latestData.feedingStatus = feedingStatus;

  console.log("📡 Received from ESP32 →", latestData);
  res.sendStatus(200);
});

// ===== ✅ API to SEND feeding time to ESP32 =====
app.get('/api/set-feeding-time', (req, res) => {
  res.json({ feedingTime: feedingRequestTime });
  feedingRequestTime = 0; // reset after sending
});

// ===== ✅ API to SET feeding time from dashboard =====
app.post('/api/set-feeding-time', (req, res) => {
  const { seconds } = req.body;

  if (!seconds || seconds < 1 || seconds > 60) {
    return res.status(400).json({ success: false, message: "Invalid time. 1–60 seconds allowed." });
  }

  feedingRequestTime = parseInt(seconds);
  latestData.lastFeedingTime = new Date().toLocaleTimeString();
  latestData.feedingAgo = "Just now";
  latestData.feedingStatus = "Feeding";

  console.log(`✅ Feeding triggered for ${seconds} seconds`);
  res.json({
    success: true,
    message: `Feeding for ${seconds} seconds.`,
    lastFeeding: latestData.lastFeedingTime
  });
});

// ===== Basic Routes =====
app.get("/", (req, res) => res.render("Landing"));
app.get("/login", (req, res) => res.render("Login"));
app.get("/signup", (req, res) => res.render("Signup"));

// ===== Dashboard =====
app.get("/dashboard", (req, res) => {
  const mockUser = {
    name: "Aditya Thakur",
    email: "akthakur1598@gmail.com",
    createdAt: new Date()
  };

  res.render("Dashboard", { user: mockUser, sensor: latestData });
});

// ===== Start Server =====
async function startServer() {
  try {
    const dbConnected = await connectDB();

    if (dbConnected) {
      const User = require('./models/User');
      const authRoutes = require('./routes/authRoutes');
      app.use('/', authRoutes);
    } else {
      console.log("⚠️ Running without database-dependent features.");
    }

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
