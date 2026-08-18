const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    duration: { type: Number, default: 4 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
