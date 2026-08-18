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
const Schedule = require('../models/Schedule');
const Exam = require('../models/Exam');
const LearningMaterial = require('../models/LearningMaterial');
const Subject = require('../models/Subject');
const PlacementPost = require('../models/PlacementPost');

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
    const totalClasses = attendance.length;
    const classesAttended = attendance.filter((a) => a.status !== 'absent').length;
    const attendanceSummary = {
      totalClasses,
      classesAttended,
      percentage: totalClasses > 0
        ? Math.round((classesAttended / totalClasses) * 100)
        : 0,
    };

    // Fetch marks summary
    const marks = await Marks.find({ student: student._id });
    const marksAverage = marks.length > 0
      ? marks.reduce((sum, m) => sum + (m.marks || 0), 0) / marks.length
      : 0;

    // Fetch pending assignments (published, not yet submitted)
    const submissions = await Submission.find({ student: student._id }).distinct('assignment');
    const pendingAssignments = await Assignment.countDocuments({
      status: 'published',
      assignedTo: student._id,
      _id: { $nin: submissions },
    });

    // Fetch notifications
    const notifications = await Notification.find({ user: userId }).limit(5);

    // Fetch upcoming events
    const events = await Event.find({ date: { $gte: new Date() } }).limit(4);

    // Fetch subject ids for this student
    const studentSubjects = await Subject.find({ course: student.course });

    // Fetch upcoming exams for the student's subjects
    const upcomingExams = await Exam.countDocuments({
      subject: { $in: studentSubjects.map((s) => s._id) },
      examDate: { $gte: new Date() },
      status: { $ne: 'completed' },
    });

    // Fetch placement posts
    const placementPosts = await PlacementPost.countDocuments({ status: 'open' });

    // Fetch the student's job applications
    const jobApplications = await JobApplication.countDocuments({ student: student._id });

    // Today's schedule for the student's subjects
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const todaysClasses = await Schedule.countDocuments({
      subject: { $in: studentSubjects.map((s) => s._id) },
      dayOfWeek: today,
    });

    res.status(200).json({
      student: {
        name: student.user?.name || req.user.name,
        studentId: student.studentId,
        department: student.department?.name,
        course: student.course?.name,
        semester: student.semester,
        cgpa: student.cgpa,
      },
      attendanceSummary,
      marksAverage: Math.round(marksAverage),
      pendingAssignments,
      notifications: notifications.length,
      upcomingEvents: events.length,
      upcomingExams,
      placementPosts,
      jobApplications,
      todaysClasses,
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

    const assignments = await Assignment.find({ assignedTo: student._id })
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

// Get weekly schedule for the student's subjects
const getStudentSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId }).populate('course');
    if (!student) return res.status(404).json({ message: 'Student record not found' });

    const studentSubjects = await Subject.find({ course: student.course });
    const schedules = await Schedule.find({ subject: { $in: studentSubjects.map((s) => s._id) } })
      .populate('subject', 'name code')
      .populate('faculty', 'employeeId')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
      .sort({ dayOfWeek: 1, startTime: 1 });

    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

// Get exams for the student's subjects
const getStudentExams = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId }).populate('course');
    if (!student) return res.status(404).json({ message: 'Student record not found' });

    const studentSubjects = await Subject.find({ course: student.course });
    const exams = await Exam.find({ subject: { $in: studentSubjects.map((s) => s._id) } })
      .populate('subject', 'name code')
      .populate('faculty', 'employeeId')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
      .sort({ examDate: 1 });

    res.json(exams);
  } catch (error) {
    next(error);
  }
};

// Get study materials for the student's subjects
const getStudentMaterials = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const student = await Student.findOne({ user: userId }).populate('course');
    if (!student) return res.status(404).json({ message: 'Student record not found' });

    const studentSubjects = await Subject.find({ course: student.course });
    const materials = await LearningMaterial.find({
      subject: { $in: studentSubjects.map((s) => s._id) },
      visibility: 'public',
    })
      .populate('subject', 'name code')
      .populate('faculty', 'employeeId')
      .populate({ path: 'faculty', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    next(error);
  }
};

// Get placement posts visible to the student
const getStudentPlacements = async (req, res, next) => {
  try {
    const posts = await PlacementPost.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(posts);
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
  getStudentSchedule,
  getStudentExams,
  getStudentMaterials,
  getStudentPlacements,
};
