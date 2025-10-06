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
      primaryKey: true,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    contentItemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: { model: 'ContentItems', key: 'id' },
      onDelete: 'CASCADE',
    },
    viewedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    rating: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
    isHelpful: { type: DataTypes.BOOLEAN, allowNull: true },
    feedbackText: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    modelName: 'UserContentInteraction',
  });
  return UserContentInteraction;
};
