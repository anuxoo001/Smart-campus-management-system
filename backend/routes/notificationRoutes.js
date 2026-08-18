const express = require('express');
const { getNotifications, markNotificationRead } = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'faculty', 'student'), getNotifications);
router.put('/:id/read', protect, authorize('admin', 'faculty', 'student'), markNotificationRead);

module.exports = router;
