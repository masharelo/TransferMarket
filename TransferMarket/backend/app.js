const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);

module.exports = app;
