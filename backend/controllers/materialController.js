const LearningMaterial = require('../models/LearningMaterial');
const Subject = require('../models/Subject');

// Get all materials for a subject
const getMaterialsBySubject = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const materials = await LearningMaterial.find({ subject: subjectId })
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    next(error);
  }
};

// Get materials uploaded by faculty
const getFacultyMaterials = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    const materials = await LearningMaterial.find({ faculty: facultyId })
      .populate('subject', 'name code')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    next(error);
  }
};

// Upload learning material
const uploadMaterial = async (req, res, next) => {
  try {
    const { faculty, subject, title, description, type, category, fileUrl, fileSize, visibility } = req.body;

    const material = await LearningMaterial.create({
      faculty,
      subject,
      title,
      description,
      type,
      category,
      fileUrl,
      fileSize,
      visibility: visibility || 'public',
    });

    await material.populate('subject', 'name code');
    res.status(201).json(material);
  } catch (error) {
    next(error);
  }
};

// Update material
const updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await LearningMaterial.findByIdAndUpdate(id, req.body, { new: true })
      .populate('subject', 'name code');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    next(error);
  }
};

// Delete material
const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await LearningMaterial.findByIdAndDelete(id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Increment download count
const incrementDownloadCount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await LearningMaterial.findByIdAndUpdate(
      id,
      { $inc: { downloads: 1 } },
      { new: true }
    ).populate('subject', 'name code');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    next(error);
  }
};

// Get materials by category
const getMaterialsByCategory = async (req, res, next) => {
  try {
    const { subjectId, category } = req.params;
    const materials = await LearningMaterial.find({ subject: subjectId, category })
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMaterialsBySubject,
  getFacultyMaterials,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  incrementDownloadCount,
  getMaterialsByCategory,
};
