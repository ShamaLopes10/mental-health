'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ContentItem extends Model {
    static associate(models) {
      
      ContentItem.belongsToMany(models.User, {
  through: models.UserContentInteraction,
  foreignKey: 'contentItemId',
  otherKey: 'userId',
  as: 'interactingUsers'
});
ContentItem.hasMany(models.UserContentInteraction, { foreignKey: 'contentItemId', as: 'userInteractions'}); 

    }
  }
  ContentItem.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contentType: {
      type: DataTypes.ENUM, // CLI generated this
      values: ['article', 'video', 'exercise'], // <<< ADD THIS LINE with your values
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true,
      }
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    estimatedTimeMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    difficulty: {
        type: DataTypes.ENUM, // CLI generated this
        values: ['easy', 'medium', 'hard'], // <<< ADD THIS LINE with your values
        allowNull: true, // Or false if it's required
    }
  }, {
    sequelize,
    modelName: 'ContentItem',
  });
  return ContentItem;
};