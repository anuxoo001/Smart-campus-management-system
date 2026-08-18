const express = require('express');
const { getSubmissions, submitAssignment } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'faculty', 'student'), getSubmissions);
router.post('/', protect, authorize('student'), submitAssignment);

module.exports = router;
