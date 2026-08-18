const express = require('express');
const {
  getPlacementPosts,
  createPlacementPost,
  updatePlacementPost,
  deletePlacementPost,
} = require('../controllers/placementController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getPlacementPosts);
router.post('/', protect, authorize('faculty', 'admin'), createPlacementPost);
router.put('/:id', protect, authorize('faculty', 'admin'), updatePlacementPost);
router.delete('/:id', protect, authorize('faculty', 'admin'), deletePlacementPost);

module.exports = router;