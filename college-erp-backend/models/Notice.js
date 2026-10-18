const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['holiday', 'exam', 'general'], default: 'general' },
  postedBy: { type: String, default: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);