const mongoose = require('mongoose');

const learningMaterialSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['PDF', 'Video', 'Document', 'Link', 'Image', 'Other'], required: true },
    category: { type: String, default: 'General' }, // e.g., "Chapter 1", "Lecture Notes"
    fileUrl: { type: String, required: true }, // URL or file path
    fileSize: { type: Number, default: 0 }, // in bytes
    downloads: { type: Number, default: 0 },
    visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningMaterial', learningMaterialSchema);
