const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Example GET all users (change as needed)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
