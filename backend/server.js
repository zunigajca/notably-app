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