const express = require('express');
const { 
  getFaculty, 
  getFacultyById,
  getFacultyDashboard,
  markAttendance,
  getSubjectStudents,
  updateMarks,
  createAssignment,
  gradeSubmission,
  getSubmittedAssignments,
  getClassRoster,
  getStudentPerformanceAnalytics,
  getClassPerformanceAnalytics,
  handleLeaveRequest,
  getPendingLeaveRequests,
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Faculty specific routes
router.get('/dashboard/overview', protect, authorize('faculty'), getFacultyDashboard);
router.post('/attendance/mark', protect, authorize('faculty'), markAttendance);
router.get('/subjects/:subjectId/students', protect, authorize('faculty'), getSubjectStudents);
router.post('/marks/update', protect, authorize('faculty'), updateMarks);
router.post('/assignments/create', protect, authorize('faculty'), createAssignment);
router.get('/assignments/:assignmentId/submissions', protect, authorize('faculty'), getSubmittedAssignments);
router.post('/submissions/grade', protect, authorize('faculty'), gradeSubmission);

// New analytics and management routes
router.get('/:facultyId/roster/:subjectId', protect, authorize('faculty', 'admin'), getClassRoster);
router.get('/:facultyId/student/:studentId/performance/:subjectId', protect, authorize('faculty', 'admin'), getStudentPerformanceAnalytics);
router.get('/:facultyId/class-analytics/:subjectId', protect, authorize('faculty', 'admin'), getClassPerformanceAnalytics);
router.get('/:facultyId/leave-requests', protect, authorize('faculty', 'admin'), getPendingLeaveRequests);
router.put('/leave/:leaveId', protect, authorize('faculty', 'admin'), handleLeaveRequest);

// General routes
router.get('/', protect, authorize('admin', 'faculty'), getFaculty);
router.get('/:id', protect, authorize('admin', 'faculty'), getFacultyById);

module.exports = router;
