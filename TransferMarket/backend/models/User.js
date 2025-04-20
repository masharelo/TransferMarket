const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  surname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pfp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    get() {
      return this.getDataValue('is_admin') === 1;
    },
    set(value) {
      this.setDataValue('is_admin', value ? 1 : 0);
    },
  },
}, {
  tableName: 'users',
  timestamps: false  
});

module.exports = User;
