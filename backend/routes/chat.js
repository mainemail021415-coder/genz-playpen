import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// ==========================================
// 1. CHAT MESSAGE MONGOOSE SCHEMA & MODEL
// ==========================================
const chatSchema = new mongoose.Schema(
  {
    room: {
      type: String,
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// Tiyakin na hindi magdo-duplicate ang Model registration
const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatSchema);

// ==========================================
// 2. CHAT ROUTES / ENDPOINTS
// ==========================================

/**
 * @route   GET /api/chat/history/:roomId
 * @desc    Kunan ng lumang chat history ang isang partikular na room
 */
router.get('/history/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ message: 'Room ID is required' });
    }

    // Hanapin ang lahat ng mensahe sa room na ito, naka-sort mula sa pinakaluma hanggang sa pinakabago
    const messages = await ChatMessage.find({ room: roomId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    res.json(messages || []);
  } catch (err) {
    console.error('Fetch chat history error:', err);
    res.status(500).json({ message: 'Error fetching chat history', error: err.message });
  }
});

/**
 * @route   POST /api/chat/send
 * @desc    I-save ang bagong ipinadalang chat message sa Database
 */
router.post('/send', async (req, res) => {
  try {
    const { room, sender, receiver, text } = req.body;

    if (!room || !sender || !receiver || !text) {
      return res.status(400).json({ message: 'All fields (room, sender, receiver, text) are required' });
    }

    const newMessage = new ChatMessage({
      room,
      sender,
      receiver,
      text
    });

    await newMessage.save();

    res.status(201).json({
      success: true,
      message: 'Message saved successfully',
      data: newMessage
    });
  } catch (err) {
    console.error('Save message error:', err);
    res.status(500).json({ message: 'Error saving message', error: err.message });
  }
});

export default router;