const express = require('express');
const {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  submitAssignment,
  getTeacherAssignments,
  getStudentTasks,
  getTeacherStats,
  getStudentStats,
  publishAssignment,
  closeAssignment,
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// General routes
router.get('/', protect, authorize('admin', 'faculty', 'student'), getAssignments);
router.post('/', protect, authorize('admin', 'faculty'), createAssignment);
router.put('/:id', protect, authorize('admin', 'faculty'), updateAssignment);
router.delete('/:id', protect, authorize('admin', 'faculty'), deleteAssignment);

// Teacher dashboard routes
router.get('/teacher/assignments', protect, authorize('faculty'), getTeacherAssignments);
router.get('/teacher/stats', protect, authorize('faculty'), getTeacherStats);
router.put('/:id/publish', protect, authorize('faculty'), publishAssignment);
router.put('/:id/close', protect, authorize('faculty'), closeAssignment);

// Student dashboard routes
router.get('/student/tasks', protect, authorize('student'), getStudentTasks);
router.get('/student/stats', protect, authorize('student'), getStudentStats);

// Submissions
router.get('/submissions', protect, authorize('admin', 'faculty', 'student'), getSubmissions);
router.post('/submissions', protect, authorize('student'), submitAssignment);

module.exports = router;
