const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

module.exports = app;
