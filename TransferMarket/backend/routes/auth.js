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

// Show Favourite Players
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

// Show Favourite Teams
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

// Show Posts
router.get('/posts', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;
  const { types = '', fav = false } = req.query;

  try {
    const typeArray = types.split(',').map(t => t.trim().toLowerCase());

    let favTags = [];
    if (fav === 'true') {
      const [players] = await sequelize.query(`
        SELECT LOWER(CONCAT(p.name, ' ', p.surname)) AS name
        FROM favourite_players f
        JOIN players p ON f.player_id = p.player_id
        WHERE f.user_id = :userId
      `, { replacements: { userId } });

      const [teams] = await sequelize.query(`
        SELECT LOWER(t.name) AS name
        FROM favourite_teams f
        JOIN teams t ON f.team_id = t.team_id
        WHERE f.user_id = :userId
      `, { replacements: { userId } });

      favTags = [...players.map(p => p.name), ...teams.map(t => t.name)];
    }

    let baseQuery = `SELECT * FROM posts`;
    const whereClauses = [];
    const replacements = {};

    if (typeArray.length > 0 && typeArray[0] !== '') {
      whereClauses.push(`LOWER(type) IN (:types)`);
      replacements.types = typeArray;
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ` + whereClauses.join(' AND ');
    }

    const [posts] = await sequelize.query(baseQuery, { replacements });

    const filteredPosts = fav === 'true'
      ? posts.filter(post => {
          const tagList = post.tags.toLowerCase().split(',').map(tag => tag.trim());
          return tagList.some(tag => favTags.includes(tag));
        })
      : posts;

    res.json(filteredPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});


// Get a single post by ID
router.get('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;

  try {
    const [posts] = await sequelize.query(
      `SELECT * FROM posts WHERE post_id = :postId`,
      {
        replacements: { postId },
      }
    );

    const post = posts[0];

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

module.exports = router;
