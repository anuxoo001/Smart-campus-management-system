const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    deadline: { type: Date, required: true },
    resources: [{ type: String }],
    allowedLateSubmission: { type: Boolean, default: false },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    attachments: [{ name: String, url: String }],
    totalPoints: { type: Number, default: 100 },
    instructions: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
