const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    selectedOption: { type: String, default: '' },
    isCorrect: { type: Boolean, default: false },
    timeSpentSeconds: { type: Number, default: 0 },
  },
  { _id: false }
);

const quizSubmissionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'submitted' },
    // ERP Features
    attemptNumber: { type: Number, default: 1, min: 1 },
    timeSpentMinutes: { type: Number, default: 0 },
    ipAddress: { type: String, default: '' },
    browserInfo: { type: String, default: '' },
    startedAt: { type: Date, default: Date.now },
    percentage: { type: Number, default: 0 },
    isLatestAttempt: { type: Boolean, default: true },
    reviewed: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', default: null },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

quizSubmissionSchema.index({ quiz: 1, student: 1, attemptNumber: 1 }, { unique: true });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
