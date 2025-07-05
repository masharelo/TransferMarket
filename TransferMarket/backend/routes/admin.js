const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middlewares/authMiddleware');
const adminOnly = require('../middlewares/adminOnly');
const { sequelize } = require('../config/db');

const validFolders = ['posts', 'teams', 'players', 'users'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = req.body.folder || req.query.folder;
    if (!validFolders.includes(folder)) {
      return cb(new Error('Invalid upload folder'));
    }
    const uploadPath = path.join(__dirname, '..', 'uploads', folder);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// List of all users
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users] = await sequelize.query(`SELECT * FROM users`);
    res.json(users);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add post to database
router.post('/add_post', authMiddleware, adminOnly, upload.single('picture'), async (req, res) => {
  try {
    const { title, paragraph, type, tags } = req.body;
    const picture = req.file ? req.file.filename : null;
    const uploaded = new Date();
    const adminId = req.user.user_id;

    await sequelize.query(
      `INSERT INTO posts (admin_id, title, paragraph, picture, uploaded, type, tags)
       VALUES (:adminId, :title, :paragraph, :picture, :uploaded, :type, :tags)`,
      {
        replacements: {
          adminId,
          title,
          paragraph,
          picture,
          uploaded,
          type,
          tags
        }
      }
    );

    res.status(201).json({ message: 'Post created successfully' });
  } catch (err) {
    console.error('Error adding post:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit post
router.put('/posts/:postId', authMiddleware, adminOnly, upload.single('picture'), async (req, res) => {
  const { postId } = req.params;
  const { title, paragraph, type, tags } = req.body;
  const newPicture = req.file ? req.file.filename : null;
  
  try {
    const [result] = await sequelize.query(
      'SELECT picture FROM posts WHERE post_id = :postId',
      { replacements: { postId } }
    );

    const oldPicture = result[0]?.picture;
    const fields = { title, paragraph, type, tags };
    if (newPicture) fields.picture = newPicture;

    const setClause = Object.keys(fields)
      .map(key => `${key} = :${key}`)
      .join(', ');

    await sequelize.query(
      `UPDATE posts SET ${setClause} WHERE post_id = :postId`,
      {
        replacements: { ...fields, postId }
      }
    );

    if (newPicture && oldPicture) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'posts', oldPicture);
      fs.unlink(oldPath, () => {});
    }

    res.json({ message: 'Post updated successfully' });
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post
router.delete('/posts/:postId', authMiddleware, adminOnly, async (req, res) => {
  const { postId } = req.params;

  try {
    const [result] = await sequelize.query(
      'SELECT picture FROM posts WHERE post_id = :postId',
      { replacements: { postId } }
    );

    const picture = result[0]?.picture;

    await sequelize.query(
      `DELETE FROM posts WHERE post_id = :postId`,
      { replacements: { postId } }
    );

    if (picture) {
      const imagePath = path.join(__dirname, '..', 'uploads', 'posts', picture);
      fs.unlink(imagePath, () => {});
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add team to database
router.post('/add_team', authMiddleware, adminOnly, upload.single('logo'), async (req, res) => {
  try {
    const { name, city, country, stadium, stadium_capacity, founded, type } = req.body;
    const logo = req.file ? req.file.filename : null;

    await sequelize.query(
      `INSERT INTO teams (name, city, country, stadium, stadium_capacity, founded, type, logo)
       VALUES (:name, :city, :country, :stadium, :stadium_capacity, :founded, :type, :logo)`,
      {
        replacements: {
          name, city, country, stadium,
          stadium_capacity: Number(stadium_capacity),
          founded, type, logo
        }
      }
    );

    res.status(201).json({ message: 'Team created successfully' });
  } catch (err) {
    console.error('Error adding team:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Edit team
router.put('/teams/:teamId', authMiddleware, adminOnly, upload.single('logo'), async (req, res) => {
  const { teamId } = req.params;
  const { name, city, country, stadium, stadium_capacity, founded, type } = req.body;
  const newLogo = req.file ? req.file.filename : null;
  
  try {
    const [result] = await sequelize.query(
      'SELECT logo FROM teams WHERE team_id = :teamId',
      { replacements: { teamId } }
    );

    const oldLogo = result[0]?.logo;
    const fields = { name, city, country, stadium, stadium_capacity, founded, type };
    if (newLogo) fields.logo = newLogo;

    const setClause = Object.keys(fields)
      .map(key => `${key} = :${key}`)
      .join(', ');

    await sequelize.query(
      `UPDATE teams SET ${setClause} WHERE team_id = :teamId`,
      {
        replacements: { ...fields, stadium_capacity: Number(stadium_capacity), teamId }
      }
    );

    if (newLogo && oldLogo) {
      const oldPath = path.join(__dirname, '..', 'uploads', 'teams', oldLogo);
      fs.unlink(oldPath, () => {});
    }

    res.json({ message: 'Team updated successfully' });
  } catch (err) {
    console.error('Error updating team:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete team
router.delete('/teams/:teamId', authMiddleware, adminOnly, async (req, res) => {
  const { teamId } = req.params;

  try {
    const [result] = await sequelize.query(
      'SELECT logo FROM teams WHERE team_id = :teamId',
      { replacements: { teamId } }
    );

    const logo = result[0]?.logo;

    await sequelize.query(
      'DELETE FROM teams WHERE team_id = :teamId',
      { replacements: { teamId } }
    );

    if (logo) {
      const logoPath = path.join(__dirname, '..', 'uploads', 'teams', logo);
      fs.unlink(logoPath, () => {});
    }

    res.json({ message: 'Team deleted successfully' });
  } catch (err) {
    console.error('Error deleting team:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;