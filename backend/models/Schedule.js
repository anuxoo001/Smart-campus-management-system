const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    class: { type: String, required: true }, // e.g., "B.Tech CSE - Semester 4"
    dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
    startTime: { type: String, required: true }, // HH:MM format
    endTime: { type: String, required: true },
    room: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
    completedDate: { type: Date, default: null },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
