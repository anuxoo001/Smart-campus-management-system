const Job = require('../models/Job');
const Company = require('../models/Company');
const JobApplication = require('../models/JobApplication');
const Student = require('../models/Student');

const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().populate('company eligibleDepartments');
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

const createJob = async (req, res, next) => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json(job);
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json({ message: 'Job deleted.' });
  } catch (error) {
    next(error);
  }
};

const applyForJob = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found.' });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const existing = await JobApplication.findOne({ student: student._id, job: job._id });
    if (existing) return res.status(400).json({ message: 'You have already applied for this job.' });

    const application = await JobApplication.create({
      student: student._id,
      job: job._id,
      resume: req.body.resume || student.resume || '',
      coverLetter: req.body.coverLetter || '',
    });

    res.status(201).json(application);
  } catch (error) {
    next(error);
  }
};

const getApplications = async (req, res, next) => {
  try {
    const applications = await JobApplication.find().populate('student job');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

module.exports = { getJobs, createJob, updateJob, deleteJob, applyForJob, getApplications };
