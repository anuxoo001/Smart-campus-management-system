const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    salary: { type: String, default: '' },
    requiredSkills: [{ type: String }],
    minCGPA: { type: Number, default: 0 },
    eligibleDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    graduationYear: { type: Number, default: 2026 },
    applicationDeadline: { type: Date, required: true },
    type: { type: String, enum: ['job', 'internship'], default: 'job' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
