const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const LeaveRequest = require('../models/LeaveRequest');
const JobApplication = require('../models/JobApplication');
const Notification = require('../models/Notification');

// Get student dashboard data
const getStudentDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId }).populate('department course');
    
    if (!student) {
      return res.status(404).json({ message: 'Student record not found' });
    }

    // Fetch attendance summary
    const attendance = await Attendance.find({ student: student._id });
    const attendanceSummary = {
      totalClasses: attendance.reduce((sum, a) => sum + a.totalClasses, 0),
      classesAttended: attendance.reduce((sum, a) => sum + a.classesAttended, 0),
      percentage: attendance.length > 0 
        ? Math.round((attendance.reduce((sum, a) => sum + a.classesAttended, 0) / 
          attendance.reduce((sum, a) => sum + a.totalClasses, 0)) * 100)
        : 0,
    };

    // Fetch marks summary
    const marks = await Marks.find({ student: student._id });
    const marksAverage = marks.length > 0
      ? marks.reduce((sum, m) => sum + (m.internal + m.assignment + m.final), 0) / (marks.length * 3)
      : 0;

    // Fetch pending assignments
    const assignments = await Assignment.find({ 'enrolledStudents': student._id }).limit(5);

    // Fetch notifications
    const notifications = await Notification.find({ recipient: userId }).limit(5);

    // Fetch upcoming events
    const events = await Event.find({ date: { $gte: new Date() } }).limit(4);

    res.status(200).json({
      student: {
        name: student.user.name,
        studentId: student.studentId,
        department: student.department.name,
        course: student.course.name,
        semester: student.semester,
        cgpa: student.cgpa,
      },
      attendanceSummary,
      marksAverage: Math.round(marksAverage),
      pendingAssignments: assignments.length,
      notifications: notifications.length,
      upcomingEvents: events.length,
    });
  } catch (error) {
    next(error);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate('user department course');
    res.json(students);
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('user department course');
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You are not allowed to update student profile.' });
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('user department course');
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json(student);
  } catch (error) {
    next(error);
  }
};

// Get student attendance records
const getStudentAttendance = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId });

    const attendance = await Attendance.find({ student: student._id })
      .populate('subject', 'name code');

    res.status(200).json(attendance);
  } catch (error) {
    next(error);
  }
};

// Get student marks
const getStudentMarks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId });

    const marks = await Marks.find({ student: student._id })
      .populate('subject', 'name code');

    res.status(200).json(marks);
  } catch (error) {
    next(error);
  }
};

// Get student assignments
const getStudentAssignments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId });

    const assignments = await Assignment.find({ enrolledStudents: student._id })
      .populate('subject faculty', 'name code')
      .sort({ deadline: 1 });

    res.status(200).json(assignments);
  } catch (error) {
    next(error);
  }
};

// Get all notices
const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find()
      .populate('author', 'name email')
      .sort({ postedDate: -1 })
      .limit(20);

    res.status(200).json(notices);
  } catch (error) {
    next(error);
  }
};

// Get all events
const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } })
      .populate('organizer', 'name email')
      .sort({ date: 1 });

    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// Get student profile
const getStudentProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const student = await Student.findOne({ user: userId })
      .populate('department course');

    res.status(200).json({
      ...user.toObject(),
      studentData: student || null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  getStudents, 
  getStudentById, 
  updateStudent,
  getStudentDashboard,
  getStudentAttendance,
  getStudentMarks,
  getStudentAssignments,
  getNotices,
  getEvents,
  getStudentProfile,
};
