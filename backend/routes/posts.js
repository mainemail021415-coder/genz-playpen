import express from 'express';
import multer from 'multer';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js'; // 👈 Import Notification Model

const router = express.Router();

// Setup Multer Storage (Memory Storage para sa Base64 conversion)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper Function para kumuha ng User ID mula sa JWT Token
const getUserIdFromToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  try {
    const token = authHeader.split(' ')[1];
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    return payload.id || payload.userId || payload._id;
  } catch (err) {
    return null;
  }
};

// ==========================================
// 1. GET ALL POSTS
// ==========================================
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar followers')
      .populate('author', 'name avatar followers')
      .populate('comments.user', 'name avatar');

    res.json(posts || []);
  } catch (err) {
    console.error('Fetch posts error:', err);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// ==========================================
// 2. CREATE A NEW POST (WITH IMAGE SUPPORT)
// ==========================================
router.post('/create', (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: 'Image upload failed or file too large.' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { content, text } = req.body;
    const postText = content || text;

    if (!postText || !postText.trim()) {
      return res.status(400).json({ message: 'Post content cannot be empty' });
    }

    let finalImageUrl = '';

    // Kung may in-upload na file via Multer
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      finalImageUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    const newPost = new Post({
      user: currentUserId,
      author: currentUserId,
      content: postText.trim(),
      image: finalImageUrl
    });

    await newPost.save();

    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'name avatar followers')
      .populate('author', 'name avatar followers');

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: 'Server error creating post: ' + err.message });
  }
});

// ==========================================
// 3. LIKE / UNLIKE A POST (WITH NOTIFICATION)
// ==========================================
router.post('/like/:postId', async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likes = post.likes || [];
    const hasLiked = likes.some((id) => String(id) === String(currentUserId));
    const postOwnerId = post.user || post.author;

    if (hasLiked) {
      // Unlike
      post.likes = likes.filter((id) => String(id) !== String(currentUserId));
    } else {
      // Like
      post.likes.push(currentUserId);

      // MAG-SAVE NG NOTIFICATION (Kung hindi sariling post)
      if (String(postOwnerId) !== String(currentUserId)) {
        const newNotif = new Notification({
          recipient: postOwnerId,
          sender: currentUserId,
          type: 'like',
          post: postId
        });
        await newNotif.save();
      }
    }

    await post.save();
    res.json({ likes: post.likes, postOwnerId });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

// ==========================================
// 4. COMMENT ON A POST (WITH NOTIFICATION)
// ==========================================
router.post('/comment/:postId', async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { postId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      user: currentUserId,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    const postOwnerId = post.user || post.author;

    // MAG-SAVE NG NOTIFICATION (Kung hindi sariling post)
    if (String(postOwnerId) !== String(currentUserId)) {
      const newNotif = new Notification({
        recipient: postOwnerId,
        sender: currentUserId,
        type: 'comment',
        post: postId
      });
      await newNotif.save();
    }

    const updatedPost = await Post.findById(postId).populate('comments.user', 'name avatar');

    res.json({ comments: updatedPost.comments, postOwnerId });
  } catch (err) {
    console.error('Comment error:', err);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// ==========================================
// 5. FOLLOW / UNFOLLOW A USER (WITH NOTIFICATION)
// ==========================================
router.post('/follow/:targetUserId', async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { targetUserId } = req.params;

    if (String(currentUserId) === String(targetUserId)) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = currentUser.following?.some((id) => String(id) === String(targetUserId));

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter((id) => String(id) !== String(targetUserId));
      targetUser.followers = targetUser.followers.filter((id) => String(id) !== String(currentUserId));
    } else {
      // Follow
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      // MAG-SAVE NG NOTIFICATION
      const newNotif = new Notification({
        recipient: targetUserId,
        sender: currentUserId,
        type: 'follow'
      });
      await newNotif.save();
    }

    await currentUser.save();
    await targetUser.save();

    res.json({
      isFollowing: !isFollowing,
      followersCount: targetUser.followers.length
    });
  } catch (err) {
    console.error('Follow error:', err);
    res.status(500).json({ message: 'Server error toggling follow' });
  }
});

// ==========================================
// 6. DELETE POST (Owner Only)
// ==========================================
router.delete('/:postId', async (req, res) => {
  try {
    const currentUserId = getUserIdFromToken(req);
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const postAuthorId = post.user || post.author;
    if (String(postAuthorId) !== String(currentUserId)) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(postId);

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

export default router;