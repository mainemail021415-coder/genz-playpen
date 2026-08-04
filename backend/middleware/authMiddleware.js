import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // I-check kung may token sa Headers (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Kunin ang token mula sa header (tatanggalin ang salitang "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // I-verify ang token gamit ang JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Kunin ang user data sa DB nang HINDI kasama ang password, ibato sa req.user
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Ituloy ang request sa susunod na function
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};