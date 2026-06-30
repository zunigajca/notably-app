const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Ensure this is exactly lowercase 'user'

const JWT_SECRET = process.env.JWT_SECRET || 'notably_super_secret_key_123';

// 1. REGISTER NEW USER
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Safety Check: Ensure no fields are empty
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields (username, email, password) are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered.' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await newUser.save();
    return res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error("CRITICAL REGISTRATION ERROR:", error);
    return res.status(500).json({ message: 'Internal server error processing registration.', error: error.message });
  }
});

// 2. LOGIN USER
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '3d' });

    return res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error("CRITICAL LOGIN ERROR:", error);
    return res.status(500).json({ message: 'Internal server error processing login.', error: error.message });
  }
});

module.exports = router;