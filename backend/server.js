const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- FORCE GOOGLE DNS FOR MONGO_URI RESOLUTION ---
// Nilalagpasan nito ang local ISP DNS blocking para sa MongoDB Atlas SRV lookup
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// --- MIDDLEWARES & CORS CONFIGURATION ---
app.use(cors({
  origin: '*', // Pinapayagan ang lahat ng connection (localhost, Vercel, atbp.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handlers para sa OPTIONS (Pre-flight CORS requests)
app.options('*', cors());

app.use(express.json());

// Siguraduhing umiiral ang 'uploads' folder para sa mga larawan
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(uploadDir));

// --- MULTER STORAGE SETUP (For Image Uploads) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// --- MONGOOSE MODELS ---

// 1. User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  followers: [{ type: String }],
  following: [{ type: String }],
  profileComments: [
    {
      author: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// 2. Post Schema
const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  likes: [{ type: String }],
  comments: [
    {
      author: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

// 3. Notification Schema
const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true },
  sender: { type: String, required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);


// --- SOCKET.IO EVENT HANDLERS ---
io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on('send_message', (data) => {
    io.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});


// --- HELPER FUNCTION FOR REALTIME NOTIFICATIONS ---
const sendNotification = async (recipient, sender, type, message) => {
  if (recipient === sender) return;

  try {
    const notif = new Notification({ recipient, sender, type, message });
    await notif.save();

    io.emit(`notification_${recipient}`, notif);
  } catch (err) {
    console.error('Error sending notification:', err);
  }
};


// ==========================================
// 🔑 AUTHENTICATION ENDPOINTS (REGISTER & LOGIN)
// ==========================================

// 1. Register Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Lahat ng fields ay kailangan.' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'May gumagamit na ng username na ito.' });
    }

    const newUser = new User({ username, password });
    await newUser.save();

    res.status(201).json({ message: 'Matagumpay na nakaregister!', user: { username: newUser.username } });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error sa pag-register.' });
  }
});

// 2. Login Endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Maling username o password.' });
    }

    res.status(200).json({
      message: 'Matagumpay na nakapag-login!',
      user: { username: user.username, bio: user.bio }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error sa pag-login.' });
  }
});


// ==========================================
// 🔍 USER ROUTES & SEARCH ENDPOINTS
// ==========================================

// 🔍 Search Users Endpoint
app.get('/api/users/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(200).json([]);
    }

    const users = await User.find({
      username: { $regex: q.trim(), $options: 'i' }
    })
      .select('username bio _id')
      .limit(10);

    res.status(200).json(users);
  } catch (err) {
    console.error('Search Users Error:', err);
    res.status(500).json({ message: 'Error searching users.' });
  }
});

// Get User Profile Data & Posts
app.get('/api/users/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: username }).sort({ createdAt: -1 });

    res.status(200).json({ user, posts });
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ message: 'Error fetching profile.' });
  }
});

// Follow / Unfollow User Toggle
app.post('/api/users/:username/follow', async (req, res) => {
  try {
    const targetUsername = req.params.username;
    const { currentUsername } = req.body;

    if (targetUsername === currentUsername) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findOne({ username: targetUsername });
    const currentUser = await User.findOne({ username: currentUsername });

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isFollowing = targetUser.followers.includes(currentUsername);

    if (isFollowing) {
      targetUser.followers = targetUser.followers.filter(u => u !== currentUsername);
      currentUser.following = currentUser.following.filter(u => u !== targetUsername);
    } else {
      targetUser.followers.push(currentUsername);
      currentUser.following.push(targetUsername);

      await sendNotification(
        targetUsername,
        currentUsername,
        'follow',
        'started following you.'
      );
    }

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ isFollowing: !isFollowing });
  } catch (err) {
    console.error('Follow Error:', err);
    res.status(500).json({ message: 'Error toggling follow.' });
  }
});

// Add Comment to User Profile (Wall / Guestbook)
app.post('/api/users/:username/comment', async (req, res) => {
  try {
    const { username } = req.params;
    const { author, text } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const newComment = { author, text, createdAt: new Date() };
    user.profileComments.unshift(newComment);
    await user.save();

    await sendNotification(
      username,
      author,
      'comment',
      'left a comment on your profile wall.'
    );

    res.status(200).json(user.profileComments);
  } catch (err) {
    console.error('Profile Comment Error:', err);
    res.status(500).json({ message: 'Error adding wall comment.' });
  }
});


// ==========================================
// 📝 POSTS ENDPOINTS
// ==========================================

// Get All Posts (Feed)
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.error('Fetch Posts Error:', err);
    res.status(500).json({ message: 'Error fetching posts.' });
  }
});

// Create New Post (With Image Upload)
app.post('/api/posts', upload.single('image'), async (req, res) => {
  try {
    const { author, content } = req.body;
    let imageUrl = '';

    if (req.file) {
      const protocol = req.protocol;
      const host = req.get('host');
      imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    const newPost = new Post({
      author,
      content: content || '',
      imageUrl
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Create Post Error:', err);
    res.status(500).json({ message: 'Error creating post.' });
  }
});

// Like / Unlike Post Toggle
app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const hasLiked = post.likes.includes(username);

    if (hasLiked) {
      post.likes = post.likes.filter(u => u !== username);
    } else {
      post.likes.push(username);

      await sendNotification(
        post.author,
        username,
        'like',
        'liked your post.'
      );
    }

    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.error('Like Post Error:', err);
    res.status(500).json({ message: 'Error liking post.' });
  }
});

// Add Comment to Post
app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { author, text } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const newComment = { author, text, createdAt: new Date() };
    post.comments.push(newComment);
    await post.save();

    await sendNotification(
      post.author,
      author,
      'comment',
      'commented on your post.'
    );

    res.status(200).json(post);
  } catch (err) {
    console.error('Comment Post Error:', err);
    res.status(500).json({ message: 'Error adding comment.' });
  }
});

// Delete Post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    if (post.author !== username) {
      return res.status(403).json({ message: 'Unauthorized to delete this post.' });
    }

    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Delete Post Error:', err);
    res.status(500).json({ message: 'Error deleting post.' });
  }
});


// ==========================================
// 🔔 NOTIFICATIONS ENDPOINTS
// ==========================================

// Get User Notifications
app.get('/api/notifications/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const notifications = await Notification.find({ recipient: username })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (err) {
    console.error('Fetch Notifications Error:', err);
    res.status(500).json({ message: 'Error fetching notifications.' });
  }
});

// Mark Notifications as Read
app.put('/api/notifications/read/:username', async (req, res) => {
  try {
    const { username } = req.params;
    await Notification.updateMany(
      { recipient: username, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({ message: 'Notifications marked as read.' });
  } catch (err) {
    console.error('Read Notifications Error:', err);
    res.status(500).json({ message: 'Error marking notifications as read.' });
  }
});


// ==========================================
// 🚀 SERVER & DATABASE CONNECTION
// ==========================================

const ATLAS_URI = 'mongodb+srv://genziplaypen:happysky15@cluster0.bvz3pdl.mongodb.net/genz_playpen?retryWrites=true&w=majority&appName=Cluster0';

const MONGO_URI = process.env.MONGO_URI || ATLAS_URI;
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully.');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
  });