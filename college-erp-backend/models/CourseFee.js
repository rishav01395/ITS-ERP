const mongoose = require('mongoose');

const courseFeeSchema = new mongoose.Schema({
  courseName: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  annualFee: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CourseFee', courseFeeSchema);