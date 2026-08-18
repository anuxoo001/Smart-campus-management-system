const express = require('express');
const { 
  getStudents, 
  getStudentById, 
  updateStudent,
  getStudentDashboard,
  getStudentAttendance,
  getStudentMarks,
  getStudentAssignments,
  getNotices,
  getEvents,
  getStudentProfile,
  getStudentSchedule,
  getStudentExams,
  getStudentMaterials,
  getStudentPlacements,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes - student specific
router.get('/dashboard/overview', protect, authorize('student'), getStudentDashboard);
router.get('/me/profile', protect, authorize('student'), getStudentProfile);
router.get('/me/attendance', protect, authorize('student'), getStudentAttendance);
router.get('/me/marks', protect, authorize('student'), getStudentMarks);
router.get('/me/assignments', protect, authorize('student'), getStudentAssignments);
router.get('/me/schedule', protect, authorize('student'), getStudentSchedule);
router.get('/me/exams', protect, authorize('student'), getStudentExams);
router.get('/me/materials', protect, authorize('student'), getStudentMaterials);
router.get('/me/placements', protect, authorize('student'), getStudentPlacements);
router.get('/notices', protect, authorize('student', 'faculty', 'admin'), getNotices);
router.get('/events', protect, authorize('student', 'faculty', 'admin'), getEvents);

// Admin/Faculty routes
router.get('/', protect, authorize('admin', 'faculty'), getStudents);
router.get('/:id', protect, authorize('admin', 'faculty', 'student'), getStudentById);
router.put('/:id', protect, authorize('admin', 'student'), updateStudent);

module.exports = router;
