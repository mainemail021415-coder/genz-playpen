import express from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';

const router = express.Router();

// 1. GET ALL USERS (Para sa Chat list at Contacts)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users || []);
  } catch (err) {
    console.error('Fetch all users error:', err);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// 2. GET USER PROFILE BY ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ message: 'Invalid User ID passed' });
    }

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userPosts = await Post.find({
      $or: [{ user: userId }, { author: userId }]
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar followers')
      .populate('author', 'name avatar followers');

    res.json({
      user,
      posts: userPosts,
      followersCount: user.followers ? user.followers.length : 0,
      followingCount: user.following ? user.following.length : 0
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;