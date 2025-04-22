const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');
const { sequelize } = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

// Register
router.post('/register', async (req, res) => {
  const { username, name, surname, email, dob, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await sequelize.query(
      `INSERT INTO users (username, name, surname, email, date_of_birth, password, is_admin)
       VALUES (:username, :name, :surname, :email, :dob, :password, 0)`,
      {
        replacements: {
          username,
          name,
          surname,
          email,
          dob,
          password: hashedPassword,
        },
      }
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await sequelize.query(
      `SELECT * FROM users WHERE username = :username`,
      {
        replacements: { username },
      }
    );

    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, is_admin: user.is_admin, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Favourite Players Show
router.get('/favourite_players', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [results] = await sequelize.query(`
      SELECT p.*
      FROM favourite_players f
      JOIN players p ON f.player_id = p.player_id
      WHERE f.user_id = :userId
    `, {
      replacements: { userId },
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

// Add Favourite Player
router.post('/favourite_players/:playerId', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  const { playerId } = req.params;

  try {
    await sequelize.query(
      `INSERT INTO favourite_players (user_id, player_id) VALUES (:userId, :playerId)
       ON CONFLICT DO NOTHING`,
      { replacements: { userId, playerId } }
    );

    res.json({ message: 'Player added to favourites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

// Remove Favourite Player
router.delete('/favourite_players/:playerId', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  const { playerId } = req.params;

  try {
    await sequelize.query(
      `DELETE FROM favourite_players WHERE user_id = :userId AND player_id = :playerId`,
      { replacements: { userId, playerId } }
    );

    res.json({ message: 'Player removed from favourites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

// Favurite Teams Show
router.get('/favourite_teams', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [results] = await sequelize.query(`
      SELECT t.*
      FROM favourite_teams f
      JOIN teams t ON f.team_id = t.team_id
      WHERE f.user_id = :userId
    `, {
      replacements: { userId },
    });

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

// Add Favourite Team
router.post('/favourite_teams/:teamId', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  const { teamId } = req.params;

  try {
    await sequelize.query(
      `INSERT INTO favourite_teams (user_id, team_id) VALUES (:userId, :teamId)
       ON CONFLICT DO NOTHING`,
      { replacements: { userId, teamId } }
    );

    res.json({ message: 'Team added to favourites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add favourite' });
  }
});

// Remove Favourite Team
router.delete('/favourite_teams/:teamId', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  const { teamId } = req.params;

  try {
    await sequelize.query(
      `DELETE FROM favourite_teams WHERE user_id = :userId AND team_id = :teamId`,
      { replacements: { userId, teamId } }
    );

    res.json({ message: 'Team removed from favourites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove favourite' });
  }
});

module.exports = router;
