const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getFacultySchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  markScheduleCompleted,
  getTodaySchedules,
} = require('../controllers/scheduleController');

const router = express.Router();

// Faculty routes
router.get('/faculty/:facultyId', protect, getFacultySchedules);
router.get('/faculty/:facultyId/today', protect, getTodaySchedules);
router.post('/', protect, authorize('faculty', 'admin'), createSchedule);
router.put('/:id', protect, authorize('faculty', 'admin'), updateSchedule);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteSchedule);
router.put('/:id/complete', protect, authorize('faculty', 'admin'), markScheduleCompleted);

module.exports = router;
