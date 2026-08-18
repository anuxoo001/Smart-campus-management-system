const PlacementPost = require('../models/PlacementPost');

// List all placement posts (students see all; faculty/admin see own too)
const getPlacementPosts = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'faculty' && req.query.mine === 'true') {
      query = { postedBy: req.user._id };
    }

    const posts = await PlacementPost.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    next(error);
  }
};

// Create a placement post (faculty / admin)
const createPlacementPost = async (req, res, next) => {
  try {
    const { title, company, role, description, package: pkg, location, minCGPA, eligibility, deadline, status } = req.body;

    if (!title || !company) {
      return res.status(400).json({ message: 'Title and company are required.' });
    }

    const post = await PlacementPost.create({
      title,
      company,
      role,
      description,
      package: pkg,
      location,
      minCGPA,
      eligibility,
      deadline,
      status,
      postedBy: req.user._id,
    });

    await post.populate('postedBy', 'name email');
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// Update a placement post
const updatePlacementPost = async (req, res, next) => {
  try {
    const post = await PlacementPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Placement post not found.' });

    if (post.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this post.' });
    }

    Object.assign(post, req.body);
    await post.save();
    await post.populate('postedBy', 'name email');
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Delete a placement post
const deletePlacementPost = async (req, res, next) => {
  try {
    const post = await PlacementPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Placement post not found.' });

    if (post.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post.' });
    }

    await post.deleteOne();
    res.json({ message: 'Placement post deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlacementPosts,
  createPlacementPost,
  updatePlacementPost,
  deletePlacementPost,
};