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
  destination: (req, file, cb) => {
    const folder = req.body.folder;
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

// Add posts to database
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


module.exports = router;