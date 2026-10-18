const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  rollNo: { type: String, sparse: true },
  department: { type: String }, // e.g. CSE, ECE, ME, MBA
  semester: { type: String },
  mobileNumber: { type: String },
  marks10th: { type: String },
  marks12th: { type: String },
  profilePicture: { type: String, default: 'default-profile.png' },
  aadharNumber: { type: String },
  address: { type: String },

  
  // Fee Management
  totalFees: { type: Number, default: 0 },
  paidFees: { type: Number, default: 0 },
  isFirstLogin: { type: Boolean,  default: true }
}, { timestamps: true });
module.exports = mongoose.model('User', userSchema);