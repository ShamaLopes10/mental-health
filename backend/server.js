require('dotenv').config();
console.log("JWT Secret:", process.env.JWT_SECRET);
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const db = require('./models'); // Sequelize models
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your React app's URL
    credentials: true // If you need to send cookies or authorization headers
}));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

app.use('/api/auth', authRoutes);

// Passport Middleware
app.use(passport.initialize());
require('./config/passport')(passport); // Passport config

// Test DB Connection
db.sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

// Routes
app.get('/', (req, res) => res.send('MindScribe Backend API Running!'));
app.use('/api/auth', require('./routes/authRoutes'));
// Add other routes later:
// app.use('/api/tasks', require('./routes/taskRoutes'));
// app.use('/api/content', require('./routes/contentRoutes'));

app.use("/api/tasks", require("./routes/tasks"));
app.use('/api/moodlogs', require('./routes/moodLogRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
// In server.js
app.use('/api/profile', require('./routes/userProfileRoutes'));

// Start the server
// app.listen(PORT, () => console)


const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));