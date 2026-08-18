const express = require('express');
const { getMarks, createMarks, updateMarks } = require('../controllers/markController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'faculty', 'student'), getMarks);
router.post('/', protect, authorize('admin', 'faculty'), createMarks);
router.put('/:id', protect, authorize('admin', 'faculty'), updateMarks);

module.exports = router;
