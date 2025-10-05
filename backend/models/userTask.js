'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserTask = sequelize.define('UserTask', {
    userid: { type: DataTypes.INTEGER, allowNull: false, field: 'userid' }, // maps JS camelCase to DB lowercase
    taskid: { type: DataTypes.INTEGER, allowNull: false, field: 'taskid' },
    completedat: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: 'UserTasks',
  timespace: true,  // actual table name
  underscored: true      // optional: maps createdAt/updatedAt to createdat/updatedat
});


  UserTask.associate = function(models) {
    UserTask.belongsTo(models.User, { foreignKey: 'userid' });
    UserTask.belongsTo(models.Task, { foreignKey: 'taskid' });
  };

  return UserTask;
};
