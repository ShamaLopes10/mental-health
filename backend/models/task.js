'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    title: { type: DataTypes.STRING, allowNull: false, field: 'title' },
    description: { type: DataTypes.TEXT, allowNull: true, field: 'description' },
    points: { type: DataTypes.INTEGER, defaultValue: 10, field: 'points' },
    moodTags: { 
      type: DataTypes.ARRAY(DataTypes.STRING), 
      allowNull: false, 
      defaultValue: [], 
      field: 'moodtags'
    },
  }, {
    tableName: 'Tasks',
    timestamps: true,
    createdAt: 'createdat',
    updatedAt: 'updatedat',
    underscored: true
  });

  Task.associate = function(models) {
    Task.hasMany(models.UserTask, { foreignKey: 'taskid', as: 'completions' });
  };

  return Task;
};
