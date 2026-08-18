const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employeeId: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: { type: String, default: 'Professor' },
    qualification: { type: String, default: '' },
    experience: { type: Number, default: 0 },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    officeHours: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);
