const ClassForumPost = require('../models/ClassForumPost');
const User = require('../models/User');

// Get all forum posts for a subject
const getSubjectForumPosts = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { category } = req.query;

    let query = { subject: subjectId };
    if (category) query.category = category;

    const posts = await ClassForumPost.find(query)
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage')
      .populate('likes', 'name')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// Create forum post
const createForumPost = async (req, res, next) => {
  try {
    const { subject, author, title, content, isAnnouncement, category, tags } = req.body;

    const post = await ClassForumPost.create({
      subject,
      author,
      title,
      content,
      isAnnouncement: isAnnouncement || false,
      category: category || 'Discussion',
      tags: tags || [],
    });

    await post.populate('author', 'name role profileImage');
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// Add reply to post
const addReply = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { author, content } = req.body;

    const post = await ClassForumPost.findByIdAndUpdate(
      postId,
      {
        $push: {
          replies: { author, content, createdAt: new Date() }
        }
      },
      { new: true }
    )
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Like a post
const likePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;

    const post = await ClassForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Toggle like
    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    await post.populate('author', 'name role profileImage');
    await post.populate('replies.author', 'name role profileImage');
    await post.populate('likes', 'name');

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Pin/Unpin post
const togglePin = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await ClassForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    await post.populate('author', 'name role profileImage');
    await post.populate('replies.author', 'name role profileImage');

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Update post
const updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { title, content, category, tags } = req.body;

    const post = await ClassForumPost.findByIdAndUpdate(
      postId,
      { title, content, category, tags },
      { new: true }
    )
      .populate('author', 'name role profileImage')
      .populate('replies.author', 'name role profileImage');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Delete post
const deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await ClassForumPost.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Get forum statistics
const getForumStats = async (req, res, next) => {
  try {
    const { subjectId } = req.params;

    const totalPosts = await ClassForumPost.countDocuments({ subject: subjectId });
    const announcements = await ClassForumPost.countDocuments({ subject: subjectId, isAnnouncement: true });
    const discussions = await ClassForumPost.countDocuments({ subject: subjectId, category: 'Discussion' });
    const questions = await ClassForumPost.countDocuments({ subject: subjectId, category: 'Question' });

    res.json({
      totalPosts,
      announcements,
      discussions,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjectForumPosts,
  createForumPost,
  addReply,
  likePost,
  togglePin,
  updatePost,
  deletePost,
  getForumStats,
};
