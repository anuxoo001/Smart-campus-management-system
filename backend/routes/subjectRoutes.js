const express = require('express');
const {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAllSubjects);
router.post('/', protect, authorize('faculty', 'admin'), createSubject);
router.put('/:id', protect, authorize('faculty', 'admin'), updateSubject);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteSubject);

module.exports = router;
