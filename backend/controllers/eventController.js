const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');

const getEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('createdBy');
    res.json(events);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

const registerForEvent = async (req, res, next) => {
  try {
    const student = await require('../models/Student').findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const existing = await EventRegistration.findOne({ event: req.params.id, student: student._id });
    if (existing) return res.status(400).json({ message: 'You already registered for this event.' });

    const registration = await EventRegistration.create({ event: req.params.id, student: student._id });
    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
};

module.exports = { getEvents, createEvent, registerForEvent };
