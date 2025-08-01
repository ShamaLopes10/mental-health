// models/task.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      // Define Task's associations here
      Task.belongsTo(models.User, { // Task belongs to a User
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Task.init({
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of the Users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    }
    // Sequelize automatically adds createdAt and updatedAt
  }, {
    sequelize,
    modelName: 'Task', // <<< CRITICAL: This must be 'Task'
    // tableName: 'Tasks' // Optional: if you want to explicitly name the table
  });
  return Task;
};