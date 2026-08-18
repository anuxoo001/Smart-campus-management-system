const Marks = require('../models/Marks');

const getMarks = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.student) query.student = req.query.student;
    if (req.query.subject) query.subject = req.query.subject;

    const marks = await Marks.find(query).populate('student subject faculty');
    res.json(marks);
  } catch (error) {
    next(error);
  }
};

const createMarks = async (req, res, next) => {
  try {
    const mark = await Marks.create(req.body);
    res.status(201).json(mark);
  } catch (error) {
    next(error);
  }
};

const updateMarks = async (req, res, next) => {
  try {
    const mark = await Marks.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!mark) return res.status(404).json({ message: 'Marks not found.' });
    res.json(mark);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMarks, createMarks, updateMarks };
