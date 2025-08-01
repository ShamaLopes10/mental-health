'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserContentInteraction extends Model {
    static associate(models) {
      UserContentInteraction.belongsTo(models.User, { foreignKey: 'userId' });
      UserContentInteraction.belongsTo(models.ContentItem, { foreignKey: 'contentItemId' });
    }
  }
  UserContentInteraction.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Part of a composite primary key
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    contentItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Part of a composite primary key
      references: { model: 'ContentItems', key: 'id' }, // Ensure 'ContentItems' is your table name
      onDelete: 'CASCADE',
    },
    viewedAt: { // Timestamp of the last view, can be updated
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    rating: { // e.g., 1-5 stars
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 5 }
    },
    isHelpful: { // Simple boolean feedback
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    feedbackText: { // Optional free-text feedback
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'UserContentInteraction',
    // Automatically adds createdAt, updatedAt. We might not need them if viewedAt serves as last interaction time.
    // Or, keep them and update viewedAt specifically.
    // timestamps: false, // If you only want viewedAt
  });
  return UserContentInteraction;
};