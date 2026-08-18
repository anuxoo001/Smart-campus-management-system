const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getSubjectForumPosts,
  createForumPost,
  addReply,
  likePost,
  togglePin,
  updatePost,
  deletePost,
  getForumStats,
} = require('../controllers/forumController');

const router = express.Router();

// Get forum posts and stats
router.get('/subject/:subjectId', protect, getSubjectForumPosts);
router.get('/subject/:subjectId/stats', protect, getForumStats);

// Create and manage posts
router.post('/', protect, createForumPost);
router.put('/:postId', protect, updatePost);
router.delete('/:postId', protect, deletePost);

// Post interactions
router.post('/:postId/reply', protect, addReply);
router.post('/:postId/like', protect, likePost);
router.post('/:postId/pin', protect, togglePin);

module.exports = router;
