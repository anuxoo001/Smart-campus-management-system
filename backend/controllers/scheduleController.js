const Schedule = require('../models/Schedule');
const Subject = require('../models/Subject');
const Faculty = require('../models/Faculty');

// Get all schedules for a faculty
const getFacultySchedules = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    const schedules = await Schedule.find({ faculty: facultyId })
      .populate('subject', 'name code')
      .sort({ dayOfWeek: 1, startTime: 1 });
    
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

// Create a new schedule
const createSchedule = async (req, res, next) => {
  try {
    const { faculty, subject, class: className, dayOfWeek, startTime, endTime, room } = req.body;

    const schedule = await Schedule.create({
      faculty,
      subject,
      class: className,
      dayOfWeek,
      startTime,
      endTime,
      room,
    });

    await schedule.populate('subject', 'name code');
    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

// Update schedule
const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndUpdate(id, req.body, { new: true })
      .populate('subject', 'name code');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

// Delete schedule
const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully', schedule });
  } catch (error) {
    next(error);
  }
};

// Mark schedule as completed
const markScheduleCompleted = async (req, res, next) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { isCompleted: true, completedDate: new Date() },
      { new: true }
    ).populate('subject', 'name code');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    res.json(schedule);
  } catch (error) {
    next(error);
  }
};

// Get schedules for today
const getTodaySchedules = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const schedules = await Schedule.find({ faculty: facultyId, dayOfWeek: today })
      .populate('subject', 'name code')
      .sort({ startTime: 1 });

    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFacultySchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  markScheduleCompleted,
  getTodaySchedules,
};
