const express = require('express');
const {
  getTeacherQuizzes,
  getStudentQuizzes,
  createQuiz,
  submitQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus,
  getQuizSubmissions,
  getQuizStats,
  getStudentsForAssignment,
  assignQuizToStudents,
  removeStudentFromQuiz,
  getQuizAnalytics,
  getSubmissionDetails,
  addSubmissionFeedback,
  getStudentAttempts,
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Teacher routes
router.get('/teacher/quizzes', protect, authorize('faculty'), getTeacherQuizzes);
router.get('/teacher/stats', protect, authorize('faculty'), getQuizStats);
router.get('/teacher/students/assignment', protect, authorize('faculty'), getStudentsForAssignment);
router.get('/teacher/:id', protect, authorize('faculty'), getQuiz);
router.put('/teacher/:id', protect, authorize('faculty'), updateQuiz);
router.delete('/teacher/:id', protect, authorize('faculty'), deleteQuiz);
router.put('/teacher/:id/status', protect, authorize('faculty'), toggleQuizStatus);
router.get('/:id/submissions', protect, authorize('faculty'), getQuizSubmissions);

// ERP Assignment routes
router.post('/:id/assign/students', protect, authorize('faculty'), assignQuizToStudents);
router.delete('/:id/assign/:studentId', protect, authorize('faculty'), removeStudentFromQuiz);

// ERP Analytics routes
router.get('/:id/analytics', protect, authorize('faculty'), getQuizAnalytics);
router.get('/submissions/:submissionId/details', protect, authorize('faculty'), getSubmissionDetails);
router.put('/submissions/:submissionId/feedback', protect, authorize('faculty'), addSubmissionFeedback);
router.get('/:id/student/:studentId/attempts', protect, authorize('faculty'), getStudentAttempts);

// Student routes
router.get('/student/quizzes', protect, authorize('student'), getStudentQuizzes);

// Public routes
router.post('/', protect, authorize('faculty'), createQuiz);
router.post('/:id/submit', protect, authorize('student'), submitQuiz);

module.exports = router;
