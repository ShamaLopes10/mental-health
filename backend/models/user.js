// mindscribe-backend/models/user.js
'use strict';
const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Main User Profile (One-to-One)
      User.hasOne(models.UserProfile, { // This is the standard 'profile'
        foreignKey: 'userId',
        as: 'profile', // <<< INTENDED AND UNIQUE USE OF 'profile' ALIAS
        onDelete: 'CASCADE', // If user is deleted, their profile is deleted
      });

      // User's Mood Logs (One-to-Many)
      User.hasMany(models.MoodLog, {
        foreignKey: 'userId',
        as: 'moodLogs'
      });

      // User's Tasks (One-to-Many)
      User.hasMany(models.Task, {
        foreignKey: 'userId',
        as: 'tasks'
      });

      // Content Items interacted with by the User (Many-to-Many through UserContentInteraction)
      User.belongsToMany(models.ContentItem, {
        through: models.UserContentInteraction, // The join table model
        foreignKey: 'userId',
        otherKey: 'contentItemId',
        as: 'interactedContent' // e.g., user.getInteractedContent()
      });

      // Direct access to UserContentInteraction records for this User (One-to-Many)
      User.hasMany(models.UserContentInteraction, {
        foreignKey: 'userId',
        as: 'contentInteractions' // e.g., user.getContentInteractions()
      });

      // **** IF YOU HAD ANOTHER MODEL PREVIOUSLY ALIASED AS 'profile', RENAME IT ****
      // Example: If you had 'UserSpecificSettings' also aliased as 'profile'
      // User.hasOne(models.UserSpecificSettings, {
      //   foreignKey: 'userId',
      //   as: 'specificSettings' // <<< CHANGED from 'profile' to something unique
      // });
    }

    // Instance method for password validation
    async isValidPassword(password) {
      try {
        return await bcrypt.compare(password, this.password);
      } catch (error) {
        console.error("Error comparing password:", error);
        return false;
      }
    }
  }

  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Username already in use!'
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Email address already in use!'
      },
      validate: {
        isEmail: {
          args: true,
          msg: 'Please enter a valid email address.'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      // Example validation:
      // validate: {
      //   len: {
      //     args: [6, 100],
      //     msg: "Password must be between 6 and 100 characters."
      //   }
      // }
    }
    // role: { // If you add roles later
    //   type: DataTypes.ENUM('user', 'admin'),
    //   defaultValue: 'user'
    // }
  }, {
    sequelize,
    modelName: 'User',
    // tableName: 'Users' // Default, usually not needed to specify
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => { // If you allow password updates
        if (user.changed('password') && user.password) { // Check if password field changed and is not null
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};