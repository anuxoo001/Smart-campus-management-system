const express = require('express');
const { getLeaveRequests, createLeaveRequest, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'faculty', 'student'), getLeaveRequests);
router.post('/', protect, authorize('student'), createLeaveRequest);
router.put('/:id/status', protect, authorize('admin', 'faculty'), updateLeaveStatus);

module.exports = router;
