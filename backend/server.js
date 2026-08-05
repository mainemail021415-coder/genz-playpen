const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// MIDDLEWARES
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// SCHEMAS & MODELS
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// UPDATED POST SCHEMA (May kasamang Comments at Likes array)
const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: [String], default: [] }, // Array ng usernames na nag-like
  comments: [
    {
      author: { type: String, required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// API ROUTES
app.get('/', (req, res) => {
  res.send('🎮 GenZ Playpen API is running!');
});

// AUTH ROUTES
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Kailangan ang username at password.' });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'May gumagamit na ng username na ito.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Gumana! Na-save na ang user sa MongoDB.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error sa pag-register.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Kailangan ang username at password.' });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Maling username o password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Maling username o password.' });

    const secretKey = process.env.JWT_SECRET || 'supersecretkey123';
    const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user._id, username: user.username }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error sa pag-login.' });
  }
});

// POSTS FEATURES (GET, CREATE, LIKE, COMMENT, DELETE)

// A. KUNIN LAHAT NG POSTS
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error sa pagkuha ng posts.' });
  }
});

// B. MAG-CREATE NG POST
app.post('/api/posts', async (req, res) => {
  try {
    const { author, content } = req.body;
    if (!content || !content.trim()) return res.status(400).json({ message: 'Bawal ang walang laman.' });

    const newPost = new Post({ author: author || 'Anonymous', content });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error sa pag-save ng post.' });
  }
});

// C. LIKE / UNLIKE A POST
app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(username);
    if (index === -1) {
      post.likes.push(username); // Like
    } else {
      post.likes.splice(index, 1); // Unlike
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error updating like.' });
  }
});

// D. MAG-ADD NG COMMENT
app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { author, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Bawal ang walang laman na comment.' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ author, text });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment.' });
  }
});

// E. MAG-DELETE NG POST
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Tiyaking ang nagbubura ay ang mismong author
    if (post.author !== username) {
      return res.status(403).json({ message: 'Wala kang permiso na burahin ito.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));