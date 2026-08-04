// backend/controllers/postController.js
const Post = require('../models/Post');

// GET ALL POSTS (Feed)
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Pinakabagong post sa taas
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error sa pag-load ng feed.", error: error.message });
  }
};

// CREATE NEW POST (With Optional Image)
exports.createPost = async (req, res) => {
  try {
    const { userId, username, content } = req.body;
    
    // Kung may in-upload na file sa multer
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    if (!content && !imagePath) {
      return res.status(400).json({ message: "Maglagay ng text o litrato bago mag-post!" });
    }

    const newPost = await Post.create({
      userId,
      username,
      content,
      image: imagePath
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: "Error sa pag-create ng post.", error: error.message });
  }
};