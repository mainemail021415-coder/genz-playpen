const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Ang user na MAKAKATANGGAP ng notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true // Inilagay para mabilis i-query ang notifications ng isang user
    },
    // Ang user na NAG-TRIGGER ng notification (e.g., ang nag-like o nag-comment)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Uri ng notification: 'like', 'comment', 'follow', atbp.
    type: {
      type: String,
      enum: ['like', 'comment', 'follow'],
      required: true
    },
    // Ang Post kung saan nag-like o nag-comment (Opsyonal kapag 'follow' type)
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    // Status kung nabasa na ng user ang notification
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    // Awtomatikong magdaragdag ng createdAt at updatedAt fields
    timestamps: true 
  }
);

module.exports = mongoose.model('Notification', notificationSchema);