'use strict';
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    points: { type: DataTypes.INTEGER, defaultValue: 0 },
    currentStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
    longestStreak: { type: DataTypes.INTEGER, defaultValue: 0 },
    lastTaskDate: { type: DataTypes.DATE, allowNull: true },
    createdAt: { type: DataTypes.DATE, field: 'createdAt' },
    updatedAt: { type: DataTypes.DATE, field: 'updatedAt' }
  }, {
    tableName: 'Users',   // exact table name
    timestamps: true,
    underscored: true
  });

  // Instance method for password validation
  User.prototype.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
  };

  // Instance method to get last 20 completed tasks
  User.prototype.getLastCompletedTasks = async function() {
    const { UserTask } = sequelize.models;
    return await UserTask.findAll({
      where: { userid: this.id },
      order: [['completedat', 'DESC']],
      limit: 20
    });
  };

  User.associate = function(models) {
    User.hasMany(models.UserTask, { foreignKey: 'userid', as: 'tasks' });
  };

  return User;
};
