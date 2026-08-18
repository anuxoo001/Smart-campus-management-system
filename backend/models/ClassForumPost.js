const mongoose = require('mongoose');

const classForumPostSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Can be faculty or student
    title: { type: String, required: true },
    content: { type: String, required: true },
    isAnnouncement: { type: Boolean, default: false }, // True if posted by faculty as class-wide
    isPinned: { type: Boolean, default: false },
    replies: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        content: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String }],
    category: { type: String, enum: ['Question', 'Discussion', 'Announcement', 'Resource'], default: 'Discussion' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClassForumPost', classForumPostSchema);
