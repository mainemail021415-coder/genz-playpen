const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// 1. MIDDLEWARES
app.use(cors({
  origin: '*', // Pinapayagan ang frontend requests mula sa Vercel / custom domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// 2. MONGODB CONNECTION
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// 3. USER SCHEMA & MODEL
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// 4. API ROUTES

// Root Route (Pang-test kung gising ang Render backend)
app.get('/', (req, res) => {
  res.send('🎮 GenZ Playpen API is running!');
});

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

    // Hash ang password
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

// B. LOGIN ROUTE (Nagsusulat at nag-aabot ng JWT Token)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Kailangan ang username at password.' });
    }

    // Hanapin ang user sa MongoDB
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Maling username o password.' });
    }

    // I-compare ang password sa hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Maling username o password.' });
    }

    // Mag-generate ng JWT token
    const secretKey = process.env.JWT_SECRET || 'supersecretkey123';
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      secretKey,
      { expiresIn: '1d' } // Valid ng 1 araw
    );

    // I-return ang token sa frontend
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

// C. PROTECTED ROUTE (Pang-test kung gumagana ang JWT token)
app.get('/api/protected', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Walang token na naibigay.' });
  }

  const secretKey = process.env.JWT_SECRET || 'supersecretkey123';

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid o expired na ang token.' });
    }
    res.json({ message: 'Welcome sa protected route!', user: decoded });
  });
});

// 5. SERVER START
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});