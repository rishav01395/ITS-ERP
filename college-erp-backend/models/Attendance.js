const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  department: { type: String, required: true },
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  records: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true }
    }
  ],
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);