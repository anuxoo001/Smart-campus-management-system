const Notice = require('../models/Notice');

const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().populate('author');
    res.json(notices);
  } catch (error) {
    next(error);
  }
};

const createNotice = async (req, res, next) => {
  try {
    const notice = await Notice.create(req.body);
    res.status(201).json(notice);
  } catch (error) {
    next(error);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!notice) return res.status(404).json({ message: 'Notice not found.' });
    res.json(notice);
  } catch (error) {
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findByIdAndDelete(req.params.id);
    if (!notice) return res.status(404).json({ message: 'Notice not found.' });
    res.json({ message: 'Notice deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
