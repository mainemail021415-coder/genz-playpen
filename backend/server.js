const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const app = express();

// MIDDLEWARES
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_URI';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// MULTER CLOUDINARY STORAGE SETUP
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'genz_playpen_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
  },
});

const upload = multer({ storage: storage });

// SCHEMAS & MODELS
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String },
  imageUrl: { type: String, default: null }, // 📸 DITO MAI-SAVE ANG UPLOADED IMAGE URL
  likes: { type: [String], default: [] },
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
app.get('/', (req, res) => res.send('🎮 GenZ Playpen API is running!'));

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
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Maling username o password.' });
    }
    const secretKey = process.env.JWT_SECRET || 'supersecretkey123';
    const token = jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful!', token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POSTS ROUTES
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts.' });
  }
});

// 📸 CREATE POST WITH FILE UPLOAD SUPPORT
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { author, content } = req.body;
    const imageUrl = req.file ? req.file.path : null; // Link galing sa Cloudinary

    if (!content && !imageUrl) {
      return res.status(400).json({ message: 'Kailangan ng text o picture para makapag-post.' });
    }

    const newPost = new Post({
      author: author || 'Anonymous',
      content: content || '',
      imageUrl: imageUrl
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ message: 'Error creating post with image.' });
  }
});

// LIKE / UNLIKE
app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(username);
    if (index === -1) {
      post.likes.push(username);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking post.' });
  }
});

// COMMENT
app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { author, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ author, text });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error commenting.' });
  }
});

// DELETE
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.author !== username) {
      return res.status(403).json({ message: 'Unauthorized action.' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));