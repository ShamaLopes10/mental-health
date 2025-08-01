'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MoodLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      moodRating: {
        type: Sequelize.INTEGER
      },
      symptoms: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      triggers: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      notes: {
        type: Sequelize.TEXT
      },
      loggedAt: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MoodLogs');
  }
};