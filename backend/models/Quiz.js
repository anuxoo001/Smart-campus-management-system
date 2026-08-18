const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length >= 2,
        message: 'Each question must have at least two options.',
      },
    },
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, default: '' },
  },
  { _id: true }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    subject: { type: String, default: 'General' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    durationMinutes: { type: Number, default: 15 },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published' },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    questions: {
      type: [questionSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'Quiz must contain at least one question.',
      },
    },
    // ERP Features
    dueDate: { type: Date, default: null },
    releaseDate: { type: Date, default: Date.now },
    maxAttempts: { type: Number, default: 1, min: 1 },
    assignmentStrategy: { type: String, enum: ['individual', 'section', 'course'], default: 'individual' },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    assignmentHistory: [
      {
        action: { type: String, enum: ['created', 'assigned', 'updated', 'closed'] },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
        timestamp: { type: Date, default: Date.now },
        details: { type: String },
      },
    ],
    showCorrectAnswers: { type: Boolean, default: true },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleOptions: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
