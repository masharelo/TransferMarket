const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Player = sequelize.define('Player', {
  player_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  position: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'players',
  timestamps: false  
});

module.exports = Player;
