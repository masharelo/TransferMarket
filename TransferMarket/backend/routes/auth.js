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
      SELECT 
        p.*, 
        CASE WHEN f.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourite,
        t.name AS current_club
      FROM players p
      INNER JOIN favourite_players f ON f.player_id = p.player_id AND f.user_id = :userId

      LEFT JOIN (
        SELECT c1.player_id, c1.team_to, c1.end_date
        FROM contracts c1
        INNER JOIN (
          SELECT player_id, MAX(start_date) AS max_start
          FROM contracts
          WHERE end_date >= CURRENT_DATE
            AND type IN ('transfer', 'loan', 'contract')
          GROUP BY player_id
        ) c2
        ON c1.player_id = c2.player_id AND c1.start_date = c2.max_start
      ) current_contract
        ON current_contract.player_id = p.player_id

      LEFT JOIN teams t 
        ON t.team_id = current_contract.team_to

      WHERE f.user_id = :userId
      ORDER BY p.player_id
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
      SELECT 
        t.*, 
        TRUE AS is_favourite,
        sq.squad_value
      FROM favourite_teams f
      JOIN teams t ON f.team_id = t.team_id
      LEFT JOIN (
        WITH latest_contracts AS (
          SELECT DISTINCT ON (player_id) *
          FROM contracts
          ORDER BY player_id, start_date DESC
        )
        SELECT 
          t.team_id,
          SUM(p.value) AS squad_value
        FROM latest_contracts lc
        JOIN players p ON lc.player_id = p.player_id
        JOIN teams t ON lc.team_to = t.team_id
        WHERE lc.end_date >= CURRENT_DATE
        GROUP BY t.team_id
      ) sq ON sq.team_id = t.team_id
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

    let baseQuery = `
      SELECT p.*, u.name AS author_name, u.surname AS author_surname
      FROM posts p
      JOIN users u ON p.admin_id = u.user_id
    `;
    const whereClauses = [];
    const replacements = {};

    if (typeArray.length > 0 && typeArray[0] !== '') {
      whereClauses.push(`LOWER(p.type) IN (:types)`);
      replacements.types = typeArray;
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ` + whereClauses.join(' AND ');
    }

    baseQuery += ` ORDER BY p.uploaded DESC`;

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

// Show a single post by ID
router.get('/posts/:postId', authMiddleware, async (req, res) => {
  const { postId } = req.params;

  try {
    const [posts] = await sequelize.query(
      `
      SELECT p.*, u.name AS author_name, u.surname AS author_surname
      FROM posts p
      JOIN users u ON p.admin_id = u.user_id
      WHERE p.post_id = :postId
      `,
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

// Show Teams
router.get('/teams', authMiddleware, async (req, res) => {
  const { offset = 0, limit = 20, name, country, sortBy } = req.query;
  const userId = req.user.user_id;

  try {
    let baseQuery = `
      SELECT t.*, 
        CASE WHEN f.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourite,
        sq.squad_value
      FROM teams t
      LEFT JOIN favourite_teams f 
        ON f.team_id = t.team_id AND f.user_id = :userId
      LEFT JOIN (
        WITH latest_contracts AS (
          SELECT DISTINCT ON (player_id) *
          FROM contracts
          ORDER BY player_id, start_date DESC
        )
        SELECT 
          t.team_id,
          SUM(p.value) AS squad_value
        FROM latest_contracts lc
        JOIN players p ON lc.player_id = p.player_id
        JOIN teams t ON lc.team_to = t.team_id
        WHERE lc.end_date >= CURRENT_DATE
        GROUP BY t.team_id
      ) sq ON sq.team_id = t.team_id
      WHERE 1=1
    `;

    const replacements = { offset: parseInt(offset), limit: parseInt(limit), userId };
    if (name) {
      baseQuery += ` AND LOWER(t.name) LIKE :likeName`;
      replacements.likeName = `%${name.toLowerCase()}%`;
    }
    if (country) {
      baseQuery += ` AND LOWER(t.country) LIKE :likeCountry`;
      replacements.likeCountry = `%${country.toLowerCase()}%`;
    }

    if (sortBy === 'squad_value') {
      baseQuery += ` ORDER BY sq.squad_value DESC NULLS LAST, t.team_id`;
    } else {
      baseQuery += ` ORDER BY t.team_id`;
    }

    baseQuery += ` OFFSET :offset LIMIT :limit`;

    const [teams] = await sequelize.query(baseQuery, { replacements });
    res.json(teams);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teams' });
  }
});

// Show a single team by ID
router.get('/teams/:teamId', authMiddleware, async (req, res) => {
  const { teamId } = req.params;
  const userId = req.user.user_id;

  try {
    const [teams] = await sequelize.query(`
      SELECT t.*, 
      CASE WHEN f.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourite
      FROM teams t
      LEFT JOIN favourite_teams f ON f.team_id = t.team_id AND f.user_id = :userId
      WHERE t.team_id = :teamId
    `, {
      replacements: {
        teamId,
        userId,
      },
    });

    const team = teams[0];

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

// Show Players
router.get('/players', authMiddleware, async (req, res) => {
  const { offset = 0, limit = 20 } = req.query;
  const userId = req.user.user_id;

  try {
    const [players] = await sequelize.query(`
      SELECT 
        p.*,
        CASE WHEN f.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourite,
        t.name AS current_club
      FROM players p
      LEFT JOIN favourite_players f 
        ON f.player_id = p.player_id AND f.user_id = :userId

      LEFT JOIN (
        SELECT c1.player_id, c1.team_to, c1.end_date
        FROM contracts c1
        INNER JOIN (
          SELECT player_id, MAX(start_date) AS max_start
          FROM contracts
          WHERE end_date >= CURRENT_DATE
            AND type IN ('transfer', 'loan', 'contract')
          GROUP BY player_id
        ) c2
        ON c1.player_id = c2.player_id AND c1.start_date = c2.max_start
      ) current_contract
        ON current_contract.player_id = p.player_id

      LEFT JOIN teams t 
        ON t.team_id = current_contract.team_to

      ORDER BY p.player_id
      OFFSET :offset LIMIT :limit
    `, {
      replacements: {
        offset: parseInt(offset),
        limit: parseInt(limit),
        userId,
      }
    });

    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});

// All Players
router.get('/players/all', authMiddleware, async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [players] = await sequelize.query(`
      SELECT p.*, 
        CASE WHEN f.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourite
      FROM players p
      LEFT JOIN favourite_players f ON f.player_id = p.player_id AND f.user_id = :userId
      ORDER BY p.player_id
    `, {
      replacements: { userId }
    });

    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch all players' });
  }
});

// Show a single player by ID
router.get('/players/:playerId', authMiddleware, async (req, res) => {
  const { playerId } = req.params;
  const userId = req.user.user_id;

  try {
    const [results] = await sequelize.query(`
      SELECT 
        p.*, 
        CASE WHEN f.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourite,
        t.name AS current_club
      FROM players p
      LEFT JOIN favourite_players f 
        ON f.player_id = p.player_id AND f.user_id = :userId

      LEFT JOIN (
        SELECT c1.player_id, c1.team_to
        FROM contracts c1
        INNER JOIN (
          SELECT player_id, MAX(start_date) AS max_start
          FROM contracts
          WHERE end_date >= CURRENT_DATE
            AND type IN ('transfer', 'loan')
          GROUP BY player_id
        ) c2
        ON c1.player_id = c2.player_id AND c1.start_date = c2.max_start
      ) current_contract
        ON current_contract.player_id = p.player_id

      LEFT JOIN teams t 
        ON t.team_id = current_contract.team_to

      WHERE p.player_id = :playerId
      LIMIT 1
    `, {
      replacements: { playerId, userId },
    });

    if (!results.length) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch player detail' });
  }
});

// Show Transfers
router.get('/transfers', authMiddleware, async (req, res) => {
  const { type, name, sortByValue } = req.query;

  try {
    const [transfers] = await sequelize.query(`
      SELECT c.type, c.player_id, c.team_from, c.team_to, c.start_date, c.end_date, c.price,
             p.name AS player_name, p.surname AS player_surname, p.picture AS player_picture, 
             t1.name AS team_from_name, t1.logo AS team_from_logo,
             t2.name AS team_to_name, t2.logo AS team_to_logo
      FROM contracts c
      JOIN players p ON c.player_id = p.player_id
      JOIN teams t1 ON c.team_from = t1.team_id
      JOIN teams t2 ON c.team_to = t2.team_id
      WHERE 1=1
        ${type ? 'AND c.type = :type' : ''}
        ${name ? 'AND LOWER(CONCAT(p.name, \' \', p.surname)) LIKE :name' : ''}
      ORDER BY ${sortByValue === 'true' ? 'c.price DESC' : 'c.start_date DESC'}
    `, {
      replacements: {
        type,
        name: name ? `%${name.toLowerCase()}%` : undefined
      }
    });

    res.json(transfers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// Get all team squads
router.get('/teams-with-squad', authMiddleware, async (req, res) => {
  try {
    const [teams] = await sequelize.query(`
      WITH latest_contracts AS (
        SELECT DISTINCT ON (player_id) *
        FROM contracts
        ORDER BY player_id, start_date DESC
      )
      SELECT 
        t.team_id,
        t.name,
        t.country,
        SUM(p.value) AS squad_value
      FROM latest_contracts lc
      JOIN players p ON lc.player_id = p.player_id
      JOIN teams t ON lc.team_to = t.team_id
      WHERE lc.end_date >= CURRENT_DATE
      GROUP BY t.team_id, t.name, t.country
    `);

    res.json(teams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch teams with squad values' });
  }
});

// Get squad of a specific team
router.get('/teams/:teamId/squad', authMiddleware, async (req, res) => {
  const { teamId } = req.params;

  try {
    const [players] = await sequelize.query(`
      WITH latest_contracts AS (
        SELECT DISTINCT ON (player_id) *
        FROM contracts
        ORDER BY player_id, start_date DESC
      )
      SELECT p.*
      FROM latest_contracts lc
      JOIN players p ON lc.player_id = p.player_id
      WHERE lc.team_to = :teamId AND lc.end_date >= CURRENT_DATE
    `, {
      replacements: { teamId }
    });

    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch squad' });
  }
});

// Get all contracts of a team by type
router.get('/teams/:teamId/contracts', authMiddleware, async (req, res) => {
  const { teamId } = req.params;
  const { type = 'all' } = req.query;

  try {
    const baseQuery = `
      SELECT c.*, 
             p.name AS player_name, p.surname AS player_surname, p.picture AS player_picture, p.nationality AS player_nationality,
             t1.name AS team_from_name, t1.logo AS team_from_logo,
             t2.name AS team_to_name, t2.logo AS team_to_logo
      FROM contracts c
      JOIN players p ON c.player_id = p.player_id
      JOIN teams t1 ON c.team_from = t1.team_id
      JOIN teams t2 ON c.team_to = t2.team_id
    `;

    let condition = '';
    const replacements = { teamId };

    if (type === 'contract') {
      condition = `
        WHERE c.type = 'contract' AND c.team_from = :teamId AND c.team_to = :teamId
      `;
    } else if (type === 'transfer') {
      condition = `
        WHERE c.type = 'transfer' AND (c.team_from = :teamId OR c.team_to = :teamId)
      `;
    } else if (type === 'loan') {
      condition = `
        WHERE c.type = 'loan' AND (c.team_from = :teamId OR c.team_to = :teamId)
      `;
    } else {
      condition = `
        WHERE 
          (c.type = 'contract' AND c.team_from = :teamId AND c.team_to = :teamId)
          OR (c.type = 'transfer' AND c.team_to = :teamId)
          OR (c.type = 'loan' AND c.team_to = :teamId)
      `;
    }

    const finalQuery = `${baseQuery} ${condition} ORDER BY c.start_date DESC`;

    const [contracts] = await sequelize.query(finalQuery, {
      replacements
    });

    res.json(contracts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Get stats for a single player
router.get('/stats/player/:id', authMiddleware, async (req, res) => {
  const playerId = req.params.id;

  const query = `
    SELECT 
      s.*, 
      t.name AS team_name, 
      t.type AS team_type, 
      t.logo AS team_logo
    FROM stats s
    JOIN teams t ON s.team_id = t.team_id
    WHERE s.player_id = :playerId
    ORDER BY s.season DESC
  `;

  try {
    const results = await sequelize.query(query, {
      replacements: { playerId },
      type: sequelize.QueryTypes.SELECT
    });

    res.json(results);
  } catch (err) {
    console.error('Error fetching player stats:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit user data
router.put('/users/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { username, email, name, surname } = req.body;

  try {
    const [users] = await sequelize.query(`SELECT * FROM users WHERE user_id = :id`, {
      replacements: { id }
    });

    const user = users[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const [existing] = await sequelize.query(
      `SELECT * FROM users WHERE (username = :username OR email = :email) AND user_id != :id`,
      { replacements: { username, email, id } }
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    await sequelize.query(
      `UPDATE users SET username = :username, email = :email, name = :name, surname = :surname WHERE user_id = :id`,
      { replacements: { username, email, name, surname, id } }
    );

    const [updatedUsers] = await sequelize.query(`SELECT * FROM users WHERE user_id = :id`, {
      replacements: { id }
    });

    return res.json(updatedUsers[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});


module.exports = router;
