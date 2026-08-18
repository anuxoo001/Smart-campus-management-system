const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Notice = require('../models/Notice');
const Subject = require('../models/Subject');
const Schedule = require('../models/Schedule');

const getFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.find().populate('user department subjects');
    res.json(faculty);
  } catch (error) {
    next(error);
  }
};

const getFacultyById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('user department subjects');
    if (!faculty) return res.status(404).json({ message: 'Faculty not found.' });
    res.json(faculty);
  } catch (error) {
    next(error);
  }
};

// Get faculty dashboard
const getFacultyDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId }).populate('subjects department');

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty record not found' });
    }

    const subjects = faculty.subjects || [];
    const subjectIds = subjects.map((s) => s._id);

    // Real student count: students enrolled in the courses this faculty teaches
    const courses = subjects.map((s) => s.course).filter(Boolean);
    const Student = require('../models/Student');
    const studentCount = await Student.countDocuments({ course: { $in: courses } });

    const assignmentCount = await Assignment.countDocuments({ faculty: faculty._id });
    const myAssignmentIds = await Assignment.find({ faculty: faculty._id }).select('_id');
    const pendingSubmissions = await Submission.countDocuments({
      status: { $ne: 'Graded' },
      assignment: { $in: myAssignmentIds },
    });
    const todaysSchedules = await Schedule.countDocuments({
      faculty: faculty._id,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()],
    });

    res.status(200).json({
      faculty: {
        id: faculty._id,
        name: faculty.user?.name || req.user.name,
        employeeId: faculty.employeeId,
        department: faculty.department?.name,
        designation: faculty.designation,
        experience: faculty.experience,
      },
      subjects: subjects.length,
      students: studentCount,
      assignments: assignmentCount,
      pendingSubmissions,
      todaysSchedules,
      subjectList: subjects.map((s) => ({ id: s._id, name: s.name, code: s.code, semester: s.semester, course: s.course?.name })),
    });
  } catch (error) {
    next(error);
  }
};

// Mark attendance
const markAttendance = async (req, res, next) => {
  try {
    const { studentId, subjectId, classesAttended, totalClasses } = req.body;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    // Verify faculty teaches this subject
    const subject = await Subject.findById(subjectId);
    if (!subject || subject.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to mark attendance for this subject' });
    }

    let attendance = await Attendance.findOne({
      student: studentId,
      subject: subjectId,
    });

    if (attendance) {
      attendance.classesAttended = classesAttended;
      attendance.totalClasses = totalClasses;
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        student: studentId,
        subject: subjectId,
        classesAttended,
        totalClasses,
        date: new Date(),
      });
    }

    res.status(200).json(attendance);
  } catch (error) {
    next(error);
  }
};

// Get subject students
const getSubjectStudents = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    const subject = await Subject.findById(subjectId);
    if (!subject || subject.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get all students in the course
    const students = await Student.find({
      course: subject.course,
      semester: { $gte: subject.semester },
    }).populate('user');

    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

// Update marks
const updateMarks = async (req, res, next) => {
  try {
    const { studentId, subjectId, internal, assignment, final } = req.body;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    // Verify authorization
    const subject = await Subject.findById(subjectId);
    if (!subject || subject.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    let marks = await Marks.findOne({
      student: studentId,
      subject: subjectId,
    });

    if (marks) {
      marks.internal = internal || marks.internal;
      marks.assignment = assignment || marks.assignment;
      marks.final = final || marks.final;
      await marks.save();
    } else {
      marks = await Marks.create({
        student: studentId,
        subject: subjectId,
        internal,
        assignment,
        final,
        semester: subject.semester,
      });
    }

    res.status(200).json(marks);
  } catch (error) {
    next(error);
  }
};

// Create assignment
const createAssignment = async (req, res, next) => {
  try {
    const { title, description, subjectId, deadline, maxScore, enrolledStudents } = req.body;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    const subject = await Subject.findById(subjectId);
    if (!subject || subject.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      subject: subjectId,
      faculty: faculty._id,
      deadline,
      maxScore,
      enrolledStudents: enrolledStudents || [],
      postedDate: new Date(),
    });

    res.status(201).json(assignment);
  } catch (error) {
    next(error);
  }
};

// Grade submission
const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId, score, feedback } = req.body;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    const submission = await Submission.findById(submissionId).populate('assignment');
    if (submission.assignment.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = 'Graded';
    submission.gradedDate = new Date();
    await submission.save();

    res.status(200).json(submission);
  } catch (error) {
    next(error);
  }
};

// Get submitted assignments
const getSubmittedAssignments = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;
    const faculty = await Faculty.findOne({ user: userId });

    const assignment = await Assignment.findById(assignmentId);
    if (assignment.faculty.toString() !== faculty._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'studentId user');

    res.status(200).json(submissions);
  } catch (error) {
    next(error);
  }
};

// Get class roster with student details
const getClassRoster = async (req, res, next) => {
  try {
    const { facultyId, subjectId } = req.params;
    
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const students = await Student.find({ course: subject.course })
      .populate('user', 'name email phone')
      .select('user studentId batch semester');

    const roster = students.map(student => ({
      _id: student._id,
      studentId: student.studentId,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      batch: student.batch,
      semester: student.semester,
    }));

    res.json(roster);
  } catch (error) {
    next(error);
  }
};

// Get student performance analytics
const getStudentPerformanceAnalytics = async (req, res, next) => {
  try {
    const { facultyId, studentId, subjectId } = req.params;

    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const marks = await Marks.find({ 
      student: studentId, 
      subject: subjectId 
    });

    const attendance = await Attendance.find({ 
      student: studentId, 
      subject: subjectId 
    });

    const assignments = await Assignment.countDocuments({ subject: subjectId });
    const submissions = await Submission.find({ 
      student: studentId 
    }).populate('assignment');

    const totalMarks = marks.reduce((sum, m) => sum + (m.marks || 0), 0);
    const averageMarks = marks.length > 0 ? totalMarks / marks.length : 0;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendancePercentage = attendance.length > 0 ? (presentDays / attendance.length) * 100 : 0;

    res.json({
      student: {
        id: student._id,
        name: student.user.name,
        studentId: student.studentId,
      },
      marks: {
        total: totalMarks,
        average: averageMarks.toFixed(2),
        count: marks.length,
      },
      attendance: {
        present: presentDays,
        total: attendance.length,
        percentage: attendancePercentage.toFixed(2),
      },
      assignments: {
        total: assignments,
        submitted: submissions.length,
        pending: assignments - submissions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get class performance analytics
const getClassPerformanceAnalytics = async (req, res, next) => {
  try {
    const { facultyId, subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const students = await Student.find({ course: subject.course });
    const marks = await Marks.find({ subject: subjectId });
    const attendance = await Attendance.find({ subject: subjectId });

    let totalMarks = 0;
    let studentMarksCount = 0;
    const marksDistribution = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };

    marks.forEach(m => {
      totalMarks += m.marks || 0;
      studentMarksCount++;

      if (m.marks >= 90) marksDistribution['A']++;
      else if (m.marks >= 80) marksDistribution['B']++;
      else if (m.marks >= 70) marksDistribution['C']++;
      else if (m.marks >= 60) marksDistribution['D']++;
      else marksDistribution['F']++;
    });

    const averageMarks = studentMarksCount > 0 ? (totalMarks / studentMarksCount).toFixed(2) : 0;
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const averageAttendance = attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(2) : 0;

    res.json({
      subject: subject.name,
      totalStudents: students.length,
      marks: {
        average: averageMarks,
        distribution: marksDistribution,
      },
      attendance: {
        average: averageAttendance,
        total: attendance.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Approve/Reject leave request
const handleLeaveRequest = async (req, res, next) => {
  try {
    const { leaveId } = req.params;
    const { status, remarks } = req.body;

    const LeaveRequest = require('../models/LeaveRequest');
    const leave = await LeaveRequest.findByIdAndUpdate(
      leaveId,
      { status, remarks, approvedBy: req.user.id },
      { new: true }
    ).populate('student');

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Send email notification to student
    const { sendEmail } = require('../utils/emailService');
    if (sendEmail) {
      sendEmail(
        leave.student.email,
        'loginNotification',
        [leave.student.name, leave.student.email, `Your leave request has been ${status}`, 'Campus Portal']
      ).catch(err => console.error('Email failed:', err));
    }

    res.json(leave);
  } catch (error) {
    next(error);
  }
};

// Get pending leave requests
const getPendingLeaveRequests = async (req, res, next) => {
  try {
    const { facultyId } = req.params;

    const LeaveRequest = require('../models/LeaveRequest');
    const leaves = await LeaveRequest.find({})
      .populate({
        path: 'student',
        select: 'studentId user semester',
        populate: { path: 'user', select: 'name email' },
      })
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFaculty,
  getFacultyById,
  getFacultyDashboard,
  markAttendance,
  getSubjectStudents,
  updateMarks,
  createAssignment,
  gradeSubmission,
  getSubmittedAssignments,
  getClassRoster,
  getStudentPerformanceAnalytics,
  getClassPerformanceAnalytics,
  handleLeaveRequest,
  getPendingLeaveRequests,
};
