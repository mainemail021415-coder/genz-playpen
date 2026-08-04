const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Siguraduhing tama ang path patungo sa User Model mo

// 1. REGISTER ROUTE
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check kung kumpleto ang ibinigay na data
    if (!username || !password) {
      return res.status(400).json({ message: "Paki-fill up ang username at password." });
    }

    // Check kung may umiiral nang user sa MongoDB
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "May gumagamit na ng username na ito." });
    }

    // I-hash ang password bago i-save sa database para secure
    const hashedPassword = await bcrypt.hash(password, 10);

    // Gawa ng bagong user document
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: "Gumana! Na-save na ang user sa MongoDB." });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error sa pag-register." });
  }
});

// 2. LOGIN ROUTE (Ito ang nagse-send ng JWT Token)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check kung kumpleto ang ibinigay na data
    if (!username || !password) {
      return res.status(400).json({ message: "Kailangan ang username at password." });
    }

    // Hanapin ang user sa MongoDB
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Maling username o password." });
    }

    // I-compare ang pumasok na password sa naka-hash na password sa database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Maling username o password." });
    }

    // Mag-generate ng JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'secretkey123';
    const token = jwt.sign(
      { id: user._id, username: user.username },
      jwtSecret,
      { expiresIn: '1d' } // Mag-e-expire ang token pagkalipas ng 1 araw
    );

    // Ibalik ang response kasama ang TOKEN sa frontend
    res.status(200).json({
      message: "Login successful!",
      token: token,
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error sa pag-login." });
  }
});

module.exports = router;