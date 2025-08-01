'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserContentInteractions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      contentItemId: {
        type: Sequelize.INTEGER
      },
      viewedAt: {
        type: Sequelize.DATE
      },
      rating: {
        type: Sequelize.INTEGER
      },
      isHelpful: {
        type: Sequelize.BOOLEAN
      },
      feedbackText: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('UserContentInteractions');
  }
};