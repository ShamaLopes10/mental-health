'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true }, // unique added
    password: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    currentStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
    longestStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastTaskDate: { type: DataTypes.DATE, allowNull: true },
    createdAt: { type: DataTypes.DATE, field: 'createdAt' },
    updatedAt: { type: DataTypes.DATE, field: 'updatedAt' }
  }, {
    tableName: 'Users',
    timestamps: true,
    underscored: false
  });

  // Hash password before saving
  User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  User.beforeUpdate(async (user, options) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Method to validate password
  User.prototype.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  // Get last 20 completed tasks
  User.prototype.getLastCompletedTasks = async function() {
    const { UserTask } = sequelize.models;
    return await UserTask.findAll({
      where: { userid: this.id },
      order: [['completedat', 'DESC']],
      limit: 20
    });
  };

  // Associations
  User.associate = function(models) {
    User.hasMany(models.UserTask, { foreignKey: 'userid', as: 'tasks' });
  };

  return User;
};
