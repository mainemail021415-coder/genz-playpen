// backend/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getPosts, createPost } = require('../controllers/postController');

// Multer Storage Configuration para sa Image Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Isasave sa backend/uploads/ folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', getPosts);
router.post('/create', upload.single('image'), createPost);

module.exports = router;