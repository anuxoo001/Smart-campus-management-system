const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getMaterialsBySubject,
  getFacultyMaterials,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  incrementDownloadCount,
  getMaterialsByCategory,
} = require('../controllers/materialController');

const router = express.Router();

// Public routes
router.get('/subject/:subjectId', protect, getMaterialsBySubject);
router.get('/subject/:subjectId/category/:category', protect, getMaterialsByCategory);

// Faculty routes
router.get('/faculty/:facultyId', protect, authorize('faculty', 'admin'), getFacultyMaterials);
router.post('/', protect, authorize('faculty', 'admin'), uploadMaterial);
router.put('/:id', protect, authorize('faculty', 'admin'), updateMaterial);
router.delete('/:id', protect, authorize('faculty', 'admin'), deleteMaterial);
router.put('/:id/download', protect, incrementDownloadCount);

module.exports = router;
