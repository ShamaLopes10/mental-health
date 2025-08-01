'use strict';
module.exports = (sequelize, DataTypes) => {
  const MoodLog = sequelize.define('MoodLog', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Name of your Users table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    moodRating: { // e.g., 1-5 or 1-10
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Example validation
        max: 5  // Example validation
      }
    },
    symptoms: { // Array of symptom tags/keywords
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    triggers: { // Optional: Array of trigger tags/keywords
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    notes: { // Optional: User's journal entry or additional notes
      type: DataTypes.TEXT,
      allowNull: true,
    },
    loggedAt: { // When the log was recorded by the user
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW // Default to current time if not provided
    }
    // Sequelize automatically adds createdAt and updatedAt
  }, {});
  MoodLog.associate = function(models) {
    MoodLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };
  return MoodLog;
};