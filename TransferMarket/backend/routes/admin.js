const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminOnly');
const { sequelize } = require('../config/db');

router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users] = await sequelize.query(`SELECT * FROM users`);
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;