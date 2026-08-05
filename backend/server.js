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
  following: { type: [String], default: [] },
  followers: { type: [String], default: [] },
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

// 🔔 NOTIFICATION SCHEMA
const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // Sino ang makakatanggap
  sender: { type: String, required: true },    // Sino ang gumawa ng aksyon
  type: { type: String, enum: ['follow', 'post_comment', 'profile_comment', 'like'], required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const Notification = mongoose.model('Notification', notificationSchema);

// Helper function para sa Real-Time Notification via Socket.io
const createAndSendNotification = async ({ recipient, sender, type, message }) => {
  if (recipient === sender) return; // Huwag i-notify ang sarili

  try {
    const notif = new Notification({ recipient, sender, type, message });
    await notif.save();

    // I-broadcast via socket sa partikular na user o sa lahat
    io.emit(`notification_${recipient}`, notif);
  } catch (err) {
    console.error('Notification creation error:', err);
  }
};

// 7. SOCKET.IO LISTENERS (REAL-TIME CHAT & USER ROOMS)
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

// 🔔 NOTIFICATIONS ROUTES
app.get('/api/notifications/:username', async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.username }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications.' });
  }
});

app.put('/api/notifications/read/:username', async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.params.username, read: false }, { read: true });
    res.status(200).json({ message: 'Notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications.' });
  }
});

// 👥 FOLLOW USER ROUTE (WITH NOTIFICATION)
app.post('/api/users/:username/follow', async (req, res) => {
  try {
    const targetUsername = req.params.username;
    const { currentUsername } = req.body;

    if (targetUsername === currentUsername) {
      return res.status(400).json({ message: 'Hindi mo pwedeng i-follow ang sarili mo.' });
    }

    const targetUser = await User.findOne({ username: targetUsername });
    const currentUser = await User.findOne({ username: currentUsername });

    if (!targetUser || !currentUser) return res.status(404).json({ message: 'User not found.' });

    const isFollowing = currentUser.following.includes(targetUsername);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(u => u !== targetUsername);
      targetUser.followers = targetUser.followers.filter(u => u !== currentUsername);
    } else {
      // Follow
      currentUser.following.push(targetUsername);
      targetUser.followers.push(currentUsername);

      // Trigger Follow Notification
      await createAndSendNotification({
        recipient: targetUsername,
        sender: currentUsername,
        type: 'follow',
        message: 'started following you.'
      });
    }

    await currentUser.save();
    await targetUser.save();

    res.status(200).json({ isFollowing: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: 'Error processing follow.' });
  }
});

// 💬 PROFILE COMMENT ROUTE (WITH NOTIFICATION)
app.post('/api/users/:username/comment', async (req, res) => {
  try {
    const targetUsername = req.params.username;
    const { author, text } = req.body;

    // Trigger Profile Comment Notification
    await createAndSendNotification({
      recipient: targetUsername,
      sender: author,
      type: 'profile_comment',
      message: `commented on your profile: "${text.substring(0, 20)}..."`
    });

    res.status(200).json({ message: 'Profile comment added successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding profile comment.' });
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

// POSTS: CREATE
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

// POSTS: LIKE / UNLIKE (WITH NOTIFICATION)
app.put('/api/posts/:id/like', async (req, res) => {
  try {
    const { username } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const index = post.likes.indexOf(username);
    if (index === -1) {
      post.likes.push(username);

      // Trigger Like Notification
      await createAndSendNotification({
        recipient: post.author,
        sender: username,
        type: 'like',
        message: 'liked your post.'
      });
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Error liking post.' });
  }
});

// POSTS: COMMENT (WITH NOTIFICATION)
app.post('/api/posts/:id/comment', async (req, res) => {
  try {
    const { author, text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ author, text });
    await post.save();

    // Trigger Post Comment Notification
    await createAndSendNotification({
      recipient: post.author,
      sender: author,
      type: 'post_comment',
      message: `commented on your post: "${text.substring(0, 20)}..."`
    });

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