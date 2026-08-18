const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Job = require('../models/Job');
const Company = require('../models/Company');
const JobApplication = require('../models/JobApplication');
const Notice = require('../models/Notice');
const Event = require('../models/Event');
const LeaveRequest = require('../models/LeaveRequest');

const getDashboardStats = async (req, res, next) => {
  try {
    const studentCount = await Student.countDocuments();
    const facultyCount = await Faculty.countDocuments();
    const courseCount = await Course.countDocuments();
    const subjectCount = await Subject.countDocuments();
    const departmentCount = await Department.countDocuments();
    const companyCount = await Company.countDocuments();
    const applicationCount = await JobApplication.countDocuments();
    const userCount = await User.countDocuments();

    res.json({
      stats: {
        userCount,
        studentCount,
        facultyCount,
        courseCount,
        subjectCount,
        departmentCount,
        companyCount,
        applicationCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// Create user (admin)
// For role 'faculty': auto-generates EmployeeId and creates a Faculty profile
// For role 'student': auto-generates StudentId and creates a Student profile
// Returns generated credentials so the admin can share them
const createUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      department,
      designation,
      qualification,
      experience,
      course,
      semester,
      batch,
    } = req.body;

    // Validate role
    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // Generate a secure default password if none provided
    const generatedPassword = password || `${role.slice(0, 3)}@${Math.floor(1000 + Math.random() * 9000)}`;

    const user = await User.create({
      name,
      email,
      password: generatedPassword,
      phone,
      role,
      isEmailVerified: true,
      isActive: true,
    });

    let employeeId = null;
    let studentId = null;
    let profile = null;

    if (role === 'faculty') {
      const count = await Faculty.countDocuments({ department });
      employeeId = `FAC${String(count + 1).padStart(3, '0')}`;
      profile = await Faculty.create({
        user: user._id,
        employeeId,
        department,
        designation: designation || 'Professor',
        qualification: qualification || '',
        experience: experience || 0,
      });
    } else if (role === 'student') {
      const count = await Student.countDocuments({ department });
      studentId = `STU${String(count + 1).padStart(3, '0')}`;
      profile = await Student.create({
        user: user._id,
        studentId,
        department,
        course,
        semester: semester || 1,
        batch: batch || String(new Date().getFullYear() - 1),
      });
    }

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      credentials: {
        email: user.email,
        password: generatedPassword,
        employeeId,
        studentId,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// Update user
const updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, phone, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone, isActive },
      { new: true }
    ).select('-password');

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Create department
const createDepartment = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    const department = await Department.create({
      name,
      code,
      description,
    });

    res.status(201).json(department);
  } catch (error) {
    next(error);
  }
};

// Get all departments
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('hod', 'name');
    res.status(200).json(departments);
  } catch (error) {
    next(error);
  }
};

// Create course
const createCourse = async (req, res, next) => {
  try {
    const { name, code, department, duration, description } = req.body;

    const course = await Course.create({
      name,
      code,
      department,
      duration,
      description,
    });

    res.status(201).json(course);
  } catch (error) {
    next(error);
  }
};

// Create subject
const createSubject = async (req, res, next) => {
  try {
    const { name, code, department, course, semester, credits, faculty, description } = req.body;

    const subject = await Subject.create({
      name,
      code,
      department,
      course,
      semester,
      credits,
      faculty,
      description,
    });

    res.status(201).json(subject);
  } catch (error) {
    next(error);
  }
};

// Create notice
const createNotice = async (req, res, next) => {
  try {
    const { title, description, category, targetAudience } = req.body;
    const userId = req.user.id;

    const notice = await Notice.create({
      title,
      description,
      category: category || 'General',
      author: userId,
      targetAudience: targetAudience || 'all',
    });

    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
};

// Create event
const createEvent = async (req, res, next) => {
  try {
    const { name, description, date, time, venue, organizer } = req.body;
    const userId = req.user.id;

    const event = await Event.create({
      name,
      description,
      date,
      time: time || '10:00 AM',
      venue,
      organizer: organizer || 'Campus Administration',
      createdBy: userId,
    });

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// Get all events
const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('organizer', 'name');
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// Approve/Reject leave request
const approveLeaveRequest = async (req, res, next) => {
  try {
    const { leaveRequestId } = req.params;
    const { status, remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await LeaveRequest.findByIdAndUpdate(
      leaveRequestId,
      { status, approvalRemarks: remarks, approvedDate: new Date() },
      { new: true }
    ).populate({ path: 'student', select: 'studentId user', populate: { path: 'user', select: 'name email' } });

    res.status(200).json(leave);
  } catch (error) {
    next(error);
  }
};

// Get leave requests (all statuses, newest first)
const getPendingLeaveRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const leaves = await LeaveRequest.find(filter)
      .populate({ path: 'student', select: 'studentId user semester', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    next(error);
  }
};

// Admin resets a user's password
const resetUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successfully.', email: user.email, password });
  } catch (error) {
    next(error);
  }
};

// Get all courses (with department populated) for admin forms
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find().populate('department', 'name code');
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};

// Get all faculty profiles for admin
const getFacultyList = async (req, res, next) => {
  try {
    const faculty = await Faculty.find()
      .populate('user', 'name email phone isActive')
      .populate('department', 'name code');
    res.status(200).json(faculty);
  } catch (error) {
    next(error);
  }
};

// Get all student profiles for admin
const getStudentList = async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate('user', 'name email phone isActive')
      .populate('department', 'name code')
      .populate('course', 'name code');
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

// Get job applications
const getJobApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find()
      .populate('job', 'title company')
      .populate('student', 'studentId user')
      .sort({ applicationDate: -1 });

    res.status(200).json(applications);
  } catch (error) {
    next(error);
  }
};

// Update job application status
const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    );

    res.status(200).json(application);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getFacultyList,
  getStudentList,
  getCourses,
  createDepartment,
  getDepartments,
  createCourse,
  createSubject,
  createNotice,
  createEvent,
  getAllEvents,
  approveLeaveRequest,
  getPendingLeaveRequests,
  getJobApplications,
  updateApplicationStatus,
};
