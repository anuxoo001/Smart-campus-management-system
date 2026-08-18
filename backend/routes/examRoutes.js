const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getFacultyExams,
  getSubjectExams,
  createExam,
  updateExam,
  deleteExam,
  updateExamStatus,
  getUpcomingExams,
  getExamStats,
} = require('../controllers/examController');

const router = express.Router();

// Faculty routes
router.get('/faculty/:facultyId', protect, authorize('faculty', 'admin'), getFacultyExams);
router.get('/faculty/:facultyId/upcoming', protect, authorize('faculty', 'admin'), getUpcomingExams);
router.get('/faculty/:facultyId/stats', protect, authorize('faculty', 'admin'), getExamStats);

// Subject routes
router.get('/subject/:subjectId', protect, getSubjectExams);

// CRUD operations
router.post('/', protect, authorize('faculty', 'admin'), createExam);
router.put('/:id', protect, authorize('faculty', 'admin'), updateExam);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteExam);
router.put('/:id/status', protect, authorize('faculty', 'admin'), updateExamStatus);

module.exports = router;
