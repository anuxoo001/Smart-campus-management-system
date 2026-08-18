const Exam = require('../models/Exam');
const Subject = require('../models/Subject');

// Get all exams for a faculty
const getFacultyExams = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    const exams = await Exam.find({ faculty: facultyId })
      .populate('subject', 'name code')
      .sort({ examDate: 1 });

    res.json(exams);
  } catch (error) {
    next(error);
  }
};

// Get exams for a subject
const getSubjectExams = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const exams = await Exam.find({ subject: subjectId })
      .populate('faculty', 'name')
      .sort({ examDate: 1 });

    res.json(exams);
  } catch (error) {
    next(error);
  }
};

// Create exam
const createExam = async (req, res, next) => {
  try {
    const { faculty, subject, title, description, examDate, startTime, endTime, duration, totalMarks, room, semester, examType, syllabus } = req.body;

    // Auto-derive semester from the subject if not provided
    let finalSemester = semester;
    if (!finalSemester && subject) {
      const subj = await Subject.findById(subject);
      finalSemester = subj?.semester;
    }

    const exam = await Exam.create({
      faculty,
      subject,
      title,
      description,
      examDate,
      startTime,
      endTime,
      duration,
      totalMarks,
      room,
      semester: finalSemester,
      examType,
      syllabus,
    });

    await exam.populate('subject', 'name code');
    res.status(201).json(exam);
  } catch (error) {
    next(error);
  }
};

// Update exam
const updateExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByIdAndUpdate(id, req.body, { new: true })
      .populate('subject', 'name code');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    next(error);
  }
};

// Delete exam
const deleteExam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByIdAndDelete(id);

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Update exam status
const updateExamStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const exam = await Exam.findByIdAndUpdate(id, { status }, { new: true })
      .populate('subject', 'name code');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    res.json(exam);
  } catch (error) {
    next(error);
  }
};

// Get upcoming exams
const getUpcomingExams = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    const now = new Date();
    
    const exams = await Exam.find({
      faculty: facultyId,
      examDate: { $gte: now }
    })
      .populate('subject', 'name code')
      .sort({ examDate: 1 });

    res.json(exams);
  } catch (error) {
    next(error);
  }
};

// Get exam statistics
const getExamStats = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    
    const totalExams = await Exam.countDocuments({ faculty: facultyId });
    const scheduledExams = await Exam.countDocuments({ faculty: facultyId, status: 'scheduled' });
    const completedExams = await Exam.countDocuments({ faculty: facultyId, status: 'completed' });

    res.json({
      totalExams,
      scheduledExams,
      completedExams,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFacultyExams,
  getSubjectExams,
  createExam,
  updateExam,
  deleteExam,
  updateExamStatus,
  getUpcomingExams,
  getExamStats,
};
