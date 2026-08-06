const express = require('express');
const router = express.Router();

// I-import ang lahat ng functions mula sa controllers/userControllers.js
const {
  registerUser,
  loginUser,
  getUserProfile,
  toggleFollow,
  searchUsers,
  addProfileComment,
  getNotifications,
  markNotificationsRead
} = require('../controllers/userControllers');

// ==========================================
// 🔑 AUTHENTICATION ROUTES
// ==========================================

// Route para sa pag-register ng bagong user
// POST /api/users/register
router.post('/register', registerUser);

// Route para sa pag-login ng user
// POST /api/users/login
router.post('/login', loginUser);

// ==========================================
// 🔍 USER SEARCH & PROFILE ROUTES
// ==========================================

// Route para sa paghahanap ng users gamit ang Search Bar
// GET /api/users/search?q=keyword
router.get('/search', searchUsers);

// Route para sa pagkuha ng Public Profile at Posts ng isang partikular na user
// GET /api/users/profile/:username
router.get('/profile/:username', getUserProfile);

// ==========================================
// 👥 FOLLOW / UNFOLLOW SYSTEM
// ==========================================

// Route para sa pag-Follow o Unfollow sa isang user
// POST /api/users/:username/follow
router.post('/:username/follow', toggleFollow);

// ==========================================
// 💬 PROFILE COMMENTS (WALL / GUESTBOOK)
// ==========================================

// Route para sa pag-iwan ng comment sa profile ng ibang user
// POST /api/users/:username/comment
router.post('/:username/comment', addProfileComment);

// ==========================================
// 🔔 NOTIFICATIONS ROUTES
// ==========================================

// Route para sa pagkuha ng notifications ng isang user
// GET /api/users/notifications/:username
router.get('/notifications/:username', getNotifications);

// Route para markahang "read" ang notifications
// PUT /api/users/notifications/read/:username
router.put('/notifications/read/:username', markNotificationsRead);

// I-export ang router para magamit sa server.js
module.exports = router;