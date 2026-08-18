const express = require('express');
const { getNotices, createNotice, updateNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'faculty', 'student'), getNotices);
router.post('/', protect, authorize('admin', 'faculty'), createNotice);
router.put('/:id', protect, authorize('admin', 'faculty'), updateNotice);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteNotice);

module.exports = router;
