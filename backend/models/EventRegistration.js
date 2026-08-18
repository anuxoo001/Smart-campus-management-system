const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['registered', 'cancelled'], default: 'registered' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
