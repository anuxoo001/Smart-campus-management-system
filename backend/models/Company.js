const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    website: { type: String, default: '' },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    industry: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);
