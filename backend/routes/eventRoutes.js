const express = require('express');
const { getEvents, createEvent, registerForEvent } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'faculty', 'student'), getEvents);
router.post('/', protect, authorize('admin', 'faculty'), createEvent);
router.post('/:id/register', protect, authorize('student'), registerForEvent);

module.exports = router;
