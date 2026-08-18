const mongoose = require('mongoose');

const placementPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    package: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    minCGPA: { type: Number, default: 0 },
    eligibility: { type: String, trim: true, default: '' },
    deadline: { type: Date },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlacementPost', placementPostSchema);