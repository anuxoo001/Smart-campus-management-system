const express = require('express');
const { getAttendance, createAttendance, updateAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'faculty', 'student'), getAttendance);
router.post('/', protect, authorize('admin', 'faculty'), createAttendance);
router.put('/:id', protect, authorize('admin', 'faculty'), updateAttendance);

module.exports = router;
