// routes/tasks.js
const express = require('express');
const router = express.Router();
const { Task, UserTask, User, sequelize } = require('../models');
const { Op } = require('sequelize'); // <= IMPORTANT: import Op directly
const authenticate = require('../middleware/authMiddleware'); // your JWT middleware


// // debug-only — remove after testing
// router.get('/__debug/db', async (req, res) => {
//   try {
//     const count = await Task.count();
//     res.json({ ok: true, tasksCount: count, dialect: sequelize.getDialect() });
//   } catch (err) {
//     console.error('DEBUG /api/tasks/__debug/db error:', err.stack || err);
//     res.status(500).json({ ok: false, error: err.message });
//   }
// });

// GET /api/tasks  -> optional query: mood=stress&search=term
router.get('/', authenticate, async (req, res) => {
  try {
    const { mood, search, type } = req.query;
    const where = {};
    if (mood) {
      where.moodtags = { [Op.contains]: [mood] };
    }
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    // ✅ updated error logging
    const tasks = await Task.findAll({
      include: [
      {
        model: UserTask,
        as: 'completions',
        attributes: ['userid', 'completedat']
      }
      ],
      order: [['points', 'DESC']],
      attributes: ['id', 'title', 'description', 'points', 'moodtags', 'createdat', 'updatedat']
    });
    res.json(tasks);
  } catch (err) {
    console.error('GET /tasks error:', err); // <- full error will be printed
    res.status(500).json({ msg: 'Server error' });
  }
});


// POST /api/tasks/:id/complete -> mark completed, award points, update streak
// routes/tasks.js
router.post('/:id/complete', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const taskId = parseInt(req.params.id, 10);
    if (!taskId) return res.status(400).json({ msg: 'Invalid task ID' });

    // 1️⃣ Check if task exists
    const task = await Task.findByPk(taskId);
    if (!task) return res.status(404).json({ msg: 'Task not found' });

    // 2️⃣ Check if user already completed this task
    const alreadyCompleted = await UserTask.findOne({ where: { userid: userId, taskid: taskId } });
    if (alreadyCompleted) return res.status(400).json({ msg: 'Task already completed' });

    // 3️⃣ Record task completion
    await UserTask.create({
      userid: userId,
      taskid: taskId,
      completedat: new Date(),
    });

    // 4️⃣ Update user points & streaks
    const user = await User.findByPk(userId);

    // Ensure fields exist
    if (typeof user.points !== 'number') user.points = 0;
    if (typeof user.currentStreak !== 'number') user.currentStreak = 0;
    if (typeof user.longestStreak !== 'number') user.longestStreak = 0;

    user.points += task.points ?? 10; // default 10 points if not set

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const lastTaskDate = user.lastTaskDate ? new Date(user.lastTaskDate) : null;

    if (lastTaskDate) {
      if (lastTaskDate.toDateString() === yesterday.toDateString()) {
        // consecutive day → increment streak
        user.currentStreak += 1;
      } else if (lastTaskDate.toDateString() === today.toDateString()) {
        // already completed today → do nothing
      } else {
        // streak broken → reset
        user.currentStreak = 1;
      }
    } else {
      // first task completion
      user.currentStreak = 1;
    }

    // update longest streak
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }

    // update lastTaskDate
    user.lastTaskDate = today;

    await user.save();

    res.json({
      msg: 'Task completed',
      updated: {
        points: user.points,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
    });
  } catch (err) {
    console.error('POST /tasks/:id/complete error:', err);
    if (err.original) console.error('Original DB error:', err.original);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});



// GET user tasks /stats
router.get('/me/stats', authenticate, async (req, res) => {
  try {
    // Fetch user basic info
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email']
    });

    // Fetch last 20 completed tasks
    const last20 = await UserTask.findAll({
      where: { userid: req.user.id },
      order: [['completedat', 'DESC']],
      limit: 20
    });

    return res.json({ user, recentCompletions: last20 });
  } catch (err) {
    console.error('GET /api/tasks/me/stats error:', err.stack || err);
    return res.status(500).json({ msg: 'Server error' });
  }
});


module.exports = router;
