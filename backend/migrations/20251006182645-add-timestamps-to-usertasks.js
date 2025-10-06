'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('UserTasks', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
    });
    await queryInterface.addColumn('UserTasks', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('UserTasks', 'createdAt');
    await queryInterface.removeColumn('UserTasks', 'updatedAt');
  }
};
