const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// 1. SOCKET.IO SETUP WITH CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// 2. MIDDLEWARES
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json());

// 3. MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_URI';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 4. CLOUDINARY CONFIGURATION
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// 5. MULTER CLOUDINARY STORAGE SETUP
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'genz_playpen_uploads',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'gif'],
  },
});

const upload = multer({ storage: storage });

// 6. SCHEMAS & MODELS
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String },
  imageUrl: { type: String, default: null },
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

// 7. SOCKET.IO LISTENERS (REAL-TIME LIVE CHAT)
io.on('connection', (socket) => {
  console.log(`⚡ User Connected: ${socket.id}`);

  socket.on('send_message', (data) => {
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User Disconnected: ${socket.id}`);
  });
});

// 8. API ROUTES

// Root Check
app.get('/', (req, res) => res.send('🎮 GenZ Playpen API is running!'));

// AUTH: REGISTER
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
    res.status(500).json({ message: 'Server error sa registration.' });
  }
});

// AUTH: LOGIN
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
    res.status(500).json({ message: 'Server error sa login.' });
  }
});

// POSTS: GET ALL
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts.' });
  }
});

// POSTS: CREATE (WITH IMAGE UPLOAD SUPPORT)
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { author, content } = req.body;
    const imageUrl = req.file ? req.file.path : null;

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
    res.status(500).json({ message: 'Error creating post.' });
  }
});

// POSTS: LIKE / UNLIKE
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

// POSTS: COMMENT
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

// POSTS: DELETE
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

// 9. LISTEN ON HTTP SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server with Socket.io listening on port ${PORT}`));