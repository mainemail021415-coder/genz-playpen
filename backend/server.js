// 1. DNS Fix para ma-bypass ang Wi-Fi/ISP blocking
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

// 2. Import Libraries
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 3. Middlewares (Pinapayagan ang requests mula sa Frontend)
app.use(cors());
app.use(express.json());

// 4. MongoDB Connection setup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch((err) => console.error('❌ Database Error:', err.message));

// 5. User Schema & Model (para sa MongoDB)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', userSchema);

// 6. Test Route (GET)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// 7. Register Route (POST) - DITO MANGYAYARI ANG SUBMIT!
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // I-save ang user sa MongoDB Atlas
    const newUser = new User({ username, password });
    await newUser.save();

    console.log('👤 New user saved:', username);
    res.status(201).json({ message: 'Gumana! Na-save na ang user sa MongoDB.' });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Nagka-error sa pag-save sa database.' });
  }
});

// 8. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Production Server running on http://localhost:${PORT}`);
});