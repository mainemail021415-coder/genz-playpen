const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// ==========================================
// 1. MIDDLEWARES
// ==========================================
app.use(cors({
  origin: '*', // Pinapayagan ang requests mula sa kahit anong domain (e.g., Vercel)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ==========================================
// 2. MONGODB CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// ==========================================
// 3. SCHEMAS & MODELS
// ==========================================

// A. USER SCHEMA
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// B. POST SCHEMA
const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

// ==========================================
// 4. API ROUTES
// ==========================================

// Root Route (Pang-test kung gising ang Render backend)
app.get('/', (req, res) => {
  res.send('🎮 GenZ Playpen API is running!');
});

// ------------------------------------------
// AUTH ROUTES (Register & Login)
// ------------------------------------------

// A. REGISTER ROUTE
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Kailangan ang username at password.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'May gumagamit na ng username na ito.' });
    }

    // Hash ang password bago i-save
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: 'Gumana! Na-save na ang user sa MongoDB.' });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error sa pag-register.' });
  }
});

// B. LOGIN ROUTE (Naglalabas ng JWT Token)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Kailangan ang username at password.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Maling username o password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Maling username o password.' });
    }

    // Mag-generate ng JWT Token
    const secretKey = process.env.JWT_SECRET || 'supersecretkey123';
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      secretKey,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful!',
      token: token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error sa pag-login.' });
  }
});

// ------------------------------------------
// POSTS ROUTES (Homefeed Features)
// ------------------------------------------

// C. GET ALL POSTS (Kunin ang lahat ng posts mula sa MongoDB)
app.get('/api/posts', async (req, res) => {
  try {
    // Kunin ang posts mula sa pinakabago (descending order)
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Fetch posts error:', error);
    res.status(500).json({ message: 'Error sa pagkuha ng posts.' });
  }
});

// D. CREATE NEW POST (I-save ang bagong post sa MongoDB)
app.post('/api/posts', async (req, res) => {
  try {
    const { author, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Hindi puwedeng walang laman ang post.' });
    }

    const newPost = new Post({
      author: author || 'Anonymous GenZ',
      content
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error sa pag-save ng post.' });
  }
});

// ==========================================
// 5. SERVER START
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});