const express = require('express');
const router = express.Router();
const { Task, UserTask, User } = require('../models');
const { Op } = require('sequelize');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, async (req,res)=>{
  const { mood, search } = req.query;
  const where = {};
  if(mood) where[sequelize.literal(`"moodtags" @> ARRAY['${mood}']::text[]`)] = true
  if(search) where.title = { [Op.iLike]: `%${search}%` };

  try {
    const tasks = await Task.findAll({ where });
    res.json(tasks);
  } catch(err){
    console.error(err); res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/:id/complete', authenticate, async (req,res)=>{
  const taskId = parseInt(req.params.id,10);
  if(!taskId) return res.status(400).json({ msg:'Invalid task id' });

  try{
    const task = await Task.findByPk(taskId);
    if(!task) return res.status(404).json({ msg:'Task not found' });

    const already = await UserTask.findOne({ where:{ userid:req.user.id, taskid:taskId }});
    if(already) return res.status(400).json({ msg:'Task already completed' });

    await UserTask.create({ userid:req.user.id, taskid:taskId, completedat: new Date() });

    const user = await User.findByPk(req.user.id);
    user.points += task.points ?? 10;
    await user.save();

    const today = new Date();
    const yesterday = new Date(); yesterday.setDate(today.getDate()-1);
    const lastTaskDate = user.lastTaskDate ? new Date(user.lastTaskDate) : null;

    if(lastTaskDate){
      if(lastTaskDate.toDateString() === yesterday.toDateString()) user.currentStreak+=1;
      else if(lastTaskDate.toDateString() !== today.toDateString()) user.currentStreak=1;
    } else user.currentStreak=1;

    if(user.currentStreak>user.longestStreak) user.longestStreak=user.currentStreak;
    user.lastTaskDate = today;
    await user.save();

    res.json({ msg:'Task completed', updated:{ points:user.points, currentStreak:user.currentStreak, longestStreak:user.longestStreak }});
  } catch(err){ console.error(err); res.status(500).json({ msg:'Server error', error: err.message }) }
});

router.get('/me/stats', authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'username', 'email'] });
    const last20 = await UserTask.findAll({
      where: { userid: req.user.id },
      order: [['completedat', 'DESC']],
      limit: 20
    });
    res.json({ user, recentCompletions: last20 });
  } catch (err) {
    console.error('GET /api/tasks/me/stats error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
