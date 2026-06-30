// FORCED DNS RESOLUTION (Bypasses local ISP blocks for MongoDB Atlas)
const dns = require('node:dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 2550;
const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

// Example Backend Fix (Express.js)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // 2. Check if user exists (preventing unhandled db errors)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    
    // 3. Logic to save user...
    const newUser = await User.create({ email, password });
    res.status(201).json(newUser);

  } catch (error) {
    console.error("Registration Error:", error); // This shows up in Render logs
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// Configure CORS correctly
app.use(cors({
  origin: 'https://notably-app-six.vercel.app', // 👈 Allows your specific frontend to talk to the backend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'] // 👈 Crucial for our new token headers!
}));

// ... existing requirements at top of server.js
const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

// ... existing database middleware mappings
app.use('/api/auth', authRoutes); // 👈 New route registration line
app.use('/api/notes', noteRoutes);

// Middleware
app.use(express.json()); // Allows us to parse JSON bodies

// Sample Route
app.get('/', (req, res) => {
    res.send('Notably API is running...');
});

// Routes Middleware
const notesRouter = require('./routes/notes');
app.use('/api/notes', notesRouter); // Directs any request to /api/notes to our notes router

// Start Server
app.listen(PORT, () => {
    console.log(`Server is cruising on port ${PORT}`);
});

// Connect to MongoDB
mongoose.connect(uri)
    .then(() => console.log("MongoDB database connection established successfully!"))
    .catch(err => {
        console.error("!!! MONGODB CONNECTION ERROR ON STARTUP !!!");
        console.error(err);
    });