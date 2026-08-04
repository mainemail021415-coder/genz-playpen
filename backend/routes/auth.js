const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Siguraduhing tama ang path patungo sa iyong User.js model

// -------------------------------------------------------------
// 1. MULTER SETUP PARA SA PROFILE PICTURE UPLOADS
// -------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ilalagay ang in-upload na avatar sa uploads/ folder sa backend
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Unique filename gamit ang timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// -------------------------------------------------------------
// 2. AUTHENTICATION MIDDLEWARE
// -------------------------------------------------------------
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Walang token, kailangan mag-login.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid o expired na token.' });
  }
};

// -------------------------------------------------------------
// 3. ROUTES
// -------------------------------------------------------------

// GET CURRENT USER PROFILE (Kunin ang profile info ng nakalog-in na user)
router.get('/profile/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User hindi nahanap.' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ message: 'Server error sa pagkuha ng profile.' });
  }
});

// GET USER PROFILE BY ID (Para sa pag-view ng profile ng ibang tao)
router.get('/profile/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User hindi nahanap.' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error sa pagkuha ng user profile.' });
  }
});

// UPDATE USER PROFILE (BIO & AVATAR EDIT)
router.put('/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;
    const { bio } = req.body;

    const updateData = {};
    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // Kapag may in-upload na bagong larawan
    if (req.file) {
      updateData.avatar = `http://localhost:5000/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Matagumpay na na-update ang profile!',
      user: updatedUser
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Server error sa pag-update ng profile.' });
  }
});

module.exports = router;