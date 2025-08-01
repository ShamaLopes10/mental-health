'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ContentItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contentType: {
        type: Sequelize.ENUM, // CLI generated this
        values: ['article', 'video', 'exercise'], // <<< ADD THIS LINE with your values
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      url: {
        type: Sequelize.STRING,
        allowNull: true
      },
      tags: {
        type: Sequelize.ARRAY(Sequelize.STRING), // This should be correct for PostgreSQL
        allowNull: true,
        defaultValue: []
      },
      source: {
        type: Sequelize.STRING,
        allowNull: true
      },
      estimatedTimeMinutes: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      difficulty: {
        type: Sequelize.ENUM, // CLI generated this
        values: ['easy', 'medium', 'hard'], // <<< ADD THIS LINE with your values
        allowNull: true // Or false
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
    await queryInterface.dropTable('ContentItems');
    // If you want to be very thorough, you might also need to drop the ENUM types
    // from PostgreSQL manually in the down migration, though for simple cases
    // just dropping the table is often sufficient during development.
    // Example for PostgreSQL (this can be database specific):
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ContentItems_contentType";');
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ContentItems_difficulty";');
  }
};