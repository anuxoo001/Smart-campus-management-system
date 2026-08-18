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

// Create user
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
    });

    res.status(201).json(user);
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
    const { title, description, category } = req.body;
    const userId = req.user.id;

    const notice = await Notice.create({
      title,
      description,
      category,
      author: userId,
      postedDate: new Date(),
    });

    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
};

// Create event
const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, venue, category, capacity } = req.body;
    const userId = req.user.id;

    const event = await Event.create({
      title,
      description,
      date,
      venue,
      category,
      capacity,
      organizer: userId,
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

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leave = await LeaveRequest.findByIdAndUpdate(
      leaveRequestId,
      { status, approvalRemarks: remarks, approvedDate: new Date() },
      { new: true }
    );

    res.status(200).json(leave);
  } catch (error) {
    next(error);
  }
};

// Get pending leave requests
const getPendingLeaveRequests = async (req, res, next) => {
  try {
    const leaves = await LeaveRequest.find({ status: 'Pending' })
      .populate('student', 'studentId user');

    res.status(200).json(leaves);
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
