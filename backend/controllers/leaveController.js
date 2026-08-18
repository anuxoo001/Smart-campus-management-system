const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');

const getLeaveRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user._id });
      if (student) filter.student = student._id;
    }

    const leaves = await LeaveRequest.find(filter).populate('student');
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

const createLeaveRequest = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const leave = await LeaveRequest.create({
      ...req.body,
      student: student._id,
    });

    res.status(201).json(leave);
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const leave = await LeaveRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
    if (!leave) return res.status(404).json({ message: 'Leave request not found.' });
    res.json(leave);
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaveRequests, createLeaveRequest, updateLeaveStatus };
