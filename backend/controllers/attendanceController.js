const Attendance = require('../models/Attendance');

const getAttendance = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.student) query.student = req.query.student;
    if (req.query.subject) query.subject = req.query.subject;
    if (req.query.faculty) query.faculty = req.query.faculty;

    const attendance = await Attendance.find(query).populate('student subject faculty');
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

const createAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!attendance) return res.status(404).json({ message: 'Attendance not found.' });
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAttendance, createAttendance, updateAttendance };
