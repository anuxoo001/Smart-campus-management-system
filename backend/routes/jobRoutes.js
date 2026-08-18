const express = require('express');
const { getJobs, createJob, updateJob, deleteJob, applyForJob, getApplications } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin', 'faculty', 'student'), getJobs);
router.post('/', protect, authorize('admin'), createJob);
router.put('/:id', protect, authorize('admin'), updateJob);
router.delete('/:id', protect, authorize('admin'), deleteJob);
router.post('/:id/apply', protect, authorize('student'), applyForJob);
router.get('/applications', protect, authorize('admin', 'faculty', 'student'), getApplications);

module.exports = router;
