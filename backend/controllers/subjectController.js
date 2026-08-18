const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');

// Get all subjects (with department/course/faculty populated)
const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('faculty', 'employeeId user')
      .sort({ name: 1 });

    res.json(subjects);
  } catch (error) {
    next(error);
  }
};

// Create a subject and assign it to the current faculty (if faculty)
const createSubject = async (req, res, next) => {
  try {
    const { name, code, department, course, semester, credits, description } = req.body;

    if (!name || !code || !semester) {
      return res.status(400).json({ message: 'Name, code and semester are required.' });
    }

    const existing = await Subject.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: `A subject with code "${code}" already exists.` });
    }

    const subject = await Subject.create({
      name,
      code,
      department,
      course,
      semester,
      credits: credits || 4,
      description: description || '',
    });

    // If a faculty member creates a subject, auto-assign it to them
    if (req.user.role === 'faculty') {
      const faculty = await Faculty.findOne({ user: req.user.id });
      if (faculty) {
        subject.faculty = faculty._id;
        await subject.save();
        await Faculty.findByIdAndUpdate(faculty._id, { $addToSet: { subjects: subject._id } });
      }
    }

    await subject.populate('department course faculty');
    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

// Update a subject
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('department course faculty');

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    next(error);
  }
};

// Delete a subject
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    // Remove from any faculty's subjects array
    await Faculty.updateMany({}, { $pull: { subjects: subject._id } });
    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
