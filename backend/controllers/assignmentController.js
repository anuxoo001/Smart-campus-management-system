const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const getAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find().populate('subject faculty assignedTo');
    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

const createAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.create(req.body);
    await assignment.populate('subject faculty assignedTo');
    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });
    await assignment.populate('subject faculty assignedTo');
    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });
    res.json({ message: 'Assignment deleted.' });
  } catch (error) {
    next(error);
  }
};

const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find().populate('assignment').populate({ path: 'student', populate: { path: 'user' } });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

// Get assignments created by a teacher
const getTeacherAssignments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });
    
    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can access teacher assignments.' });
    }

    const assignments = await Assignment.find({ faculty: faculty._id })
      .populate('subject assignedTo')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

// Get tasks assigned to a student
const getStudentTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId });
    
    if (!student) {
      return res.status(403).json({ message: 'Only students can access assigned tasks.' });
    }

    const tasks = await Assignment.find({ assignedTo: student._id })
      .populate('subject faculty')
      .sort({ deadline: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get teacher dashboard stats
const getTeacherStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });
    
    if (!faculty) {
      return res.status(403).json({ message: 'Only faculty can access dashboard stats.' });
    }

    const totalAssignments = await Assignment.countDocuments({ faculty: faculty._id });
    const publishedAssignments = await Assignment.countDocuments({ faculty: faculty._id, status: 'published' });
    const draftAssignments = await Assignment.countDocuments({ faculty: faculty._id, status: 'draft' });
    const closedAssignments = await Assignment.countDocuments({ faculty: faculty._id, status: 'closed' });
    
    const allAssignments = await Assignment.find({ faculty: faculty._id }).populate('assignedTo');
    const totalStudentsAssigned = new Set(allAssignments.flatMap(a => a.assignedTo.map(s => s._id.toString()))).size;

    const submissions = await Submission.find({
      assignment: { $in: await Assignment.find({ faculty: faculty._id }).select('_id') }
    });
    const totalSubmissions = submissions.length;
    const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;

    res.json({
      totalAssignments,
      publishedAssignments,
      draftAssignments,
      closedAssignments,
      totalStudentsAssigned,
      totalSubmissions,
      pendingSubmissions,
    });
  } catch (error) {
    next(error);
  }
};

// Get student dashboard stats
const getStudentStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId });
    
    if (!student) {
      return res.status(403).json({ message: 'Only students can access dashboard stats.' });
    }

    const assignedTasks = await Assignment.find({ assignedTo: student._id });
    const totalTasks = assignedTasks.length;

    const submissions = await Submission.find({
      student: student._id,
      assignment: { $in: assignedTasks.map(a => a._id) }
    });

    const pendingTasks = assignedTasks.filter(task => {
      const submission = submissions.find(s => s.assignment.toString() === task._id.toString());
      return !submission || submission.status === 'pending';
    }).length;

    const submittedTasks = submissions.filter(s => s.status === 'submitted').length;
    const gradedTasks = submissions.filter(s => s.status === 'graded').length;

    const overdueTasks = assignedTasks.filter(task => {
      const submission = submissions.find(s => s.assignment.toString() === task._id.toString());
      return task.deadline < new Date() && (!submission || submission.status === 'pending');
    }).length;

    res.json({
      totalTasks,
      pendingTasks,
      submittedTasks,
      gradedTasks,
      overdueTasks,
    });
  } catch (error) {
    next(error);
  }
};

// Publish an assignment
const publishAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    ).populate('subject faculty assignedTo');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

// Close an assignment
const closeAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status: 'closed' },
      { new: true }
    ).populate('subject faculty assignedTo');
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    res.json(assignment);
  } catch (error) {
    next(error);
  }
};

const submitAssignment = async (req, res, next) => {
  try {
    const { assignment, fileUrl } = req.body;
    if (!assignment || !fileUrl) {
      return res.status(400).json({ message: 'Assignment and file URL are required.' });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const assignmentDoc = await Assignment.findById(assignment);
    if (!assignmentDoc) {
      return res.status(404).json({ message: 'Assignment not found.' });
    }

    let submission = await Submission.findOne({ assignment, student: student._id });
    if (submission) {
      submission.fileUrl = fileUrl;
      submission.status = 'submitted';
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = await Submission.create({
        assignment,
        student: student._id,
        fileUrl,
        status: 'submitted',
      });
    }

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getSubmissions,
  getTeacherAssignments,
  getStudentTasks,
  getTeacherStats,
  getStudentStats,
  publishAssignment,
  closeAssignment,
  submitAssignment,
};
