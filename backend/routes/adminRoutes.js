const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  createDepartment,
  getDepartments,
  createCourse,
  createSubject,
  createNotice,
  createEvent,
  getAllEvents,
  approveLeaveRequest,
  getPendingLeaveRequests,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/adminController');

const router = express.Router();

// Dashboard
router.get('/dashboard', protect, authorize('admin'), getDashboardStats);

// User management
router.get('/users', protect, authorize('admin'), getAllUsers);
router.post('/users/create', protect, authorize('admin'), createUser);
router.put('/users/:userId', protect, authorize('admin'), updateUser);
router.delete('/users/:userId', protect, authorize('admin'), deleteUser);

// Department management
router.get('/departments', protect, authorize('admin'), getDepartments);
router.post('/departments/create', protect, authorize('admin'), createDepartment);

// Course management
router.post('/courses/create', protect, authorize('admin'), createCourse);

// Subject management
router.post('/subjects/create', protect, authorize('admin'), createSubject);

// Notice management
router.post('/notices/create', protect, authorize('admin'), createNotice);

// Event management
router.get('/events', protect, authorize('admin'), getAllEvents);
router.post('/events/create', protect, authorize('admin'), createEvent);

// Leave request management
router.get('/leave-requests/pending', protect, authorize('admin'), getPendingLeaveRequests);
router.put('/leave-requests/:leaveRequestId', protect, authorize('admin'), approveLeaveRequest);

// Job applications
router.get('/job-applications', protect, authorize('admin'), getJobApplications);
router.put('/job-applications/:applicationId/status', protect, authorize('admin'), updateApplicationStatus);

module.exports = router;
