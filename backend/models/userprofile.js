'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      // Each UserProfile belongs to one User
      UserProfile.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user', // Optional alias
        onDelete: 'CASCADE', // If a User is deleted, their profile is also deleted
      });
    }
  }
  UserProfile.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // userId will be both PK and FK
      references: {
        model: 'Users', // Name of your Users table (Sequelize default)
        key: 'id',
      }
    },
    areas_of_concern: { // e.g., ["anxiety", "stress", "sleep"]
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true, // Allow it to be null or empty initially
      defaultValue: [], // Default to an empty array
    },
    preferred_content_types: { // e.g., ["article", "video"]
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    // You can add more preferences here later, e.g.:
    // preferred_strategies: DataTypes.ARRAY(DataTypes.STRING),
    // notification_preferences: DataTypes.JSONB, // For more complex settings
  }, {
    sequelize,
    modelName: 'UserProfile',
    tableName: 'UserProfiles' // Explicitly using plural, Sequelize default
                              // If your table is singular, change this to 'UserProfile'
  });
  return UserProfile;
};