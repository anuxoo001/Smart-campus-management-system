const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'late', 'pending'],
      default: 'submitted',
    },
    marks: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);
