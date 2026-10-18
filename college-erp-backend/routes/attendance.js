const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT Token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
};

// 1. MARK SINGLE/BATCH ATTENDANCE API
router.post('/mark', verifyToken, async (req, res) => {
  try {
    const { department, semester, subject, records, date } = req.body;

    if (!department || !semester || !subject || !records || records.length === 0) {
      return res.status(400).json({ message: 'All fields and student records are required.' });
    }

    const newAttendance = new Attendance({
      department,
      semester,
      subject,
      records,
      date: date || new Date(),
      markedBy: req.user.id // Teacher ID from JWT token
    });

    await newAttendance.save();
    res.status(201).json({ message: 'Attendance marked successfully!', data: newAttendance });
  } catch (error) {
    console.error('Mark Attendance Error:', error);
    res.status(500).json({ message: 'Server error while marking attendance.', error: error.message });
  }
});

// 2. MARK BULK ATTENDANCE API (Batch Format - Optimized)
router.post('/mark-bulk', verifyToken, async (req, res) => {
  try {
    const { department, semester, subject, attendanceRecords, date } = req.body;

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return res.status(400).json({ message: 'Attendance records are required.' });
    }

    // Standardizing records structure
    const formattedRecords = attendanceRecords.map(record => ({
      studentId: record.studentId || record.student,
      rollNumber: record.rollNo || record.rollNumber,
      status: record.status || 'Absent'
    }));

    const bulkAttendance = new Attendance({
      department: department || 'CS',
      semester: semester || '1',
      subject: subject || 'General',
      records: formattedRecords,
      date: date || new Date(),
      markedBy: req.user.id
    });

    await bulkAttendance.save();
    res.status(200).json({ message: 'Bulk attendance saved successfully!', data: bulkAttendance });
  } catch (err) {
    console.error('Bulk Attendance Error:', err);
    res.status(500).json({ message: 'Error saving bulk attendance', error: err.message });
  }
});

// 3. VIEW ATTENDANCE API
router.get('/view', verifyToken, async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate('markedBy', 'name email')
      .populate('records.studentId', 'name email rollNumber');
      
    res.json(attendanceRecords);
  } catch (error) {
    console.error('View Attendance Error:', error);
    res.status(500).json({ message: 'Server error while fetching attendance.' });
  }
});

// 4. STUDENT MONTH-WISE STATS API (For Dashboard Bar Graph)
router.get('/student-monthly-stats', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.id;
    
    // Fetch all attendance documents containing this student's ID
    const allAttendance = await Attendance.find({
      'records.studentId': studentId
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStats = {};

    // Grouping & Calculating month-wise percentage
    allAttendance.forEach(doc => {
      const monthIndex = new Date(doc.date || doc.createdAt).getMonth();
      const monthName = monthNames[monthIndex];

      if (!monthStats[monthName]) {
        monthStats[monthName] = { total: 0, present: 0 };
      }

      const studentRecord = doc.records.find(r => r.studentId.toString() === studentId);
      if (studentRecord) {
        monthStats[monthName].total += 1;
        if (studentRecord.status.toLowerCase() === 'present') {
          monthStats[monthName].present += 1;
        }
      }
    });

    // Formatting result for Recharts
    const result = Object.keys(monthStats).map(month => ({
      month,
      percentage: Math.round((monthStats[month].present / monthStats[month].total) * 100) || 0
    }));

    res.json(result);
  } catch (error) {
    console.error('Fetch Stats Error:', error);
    res.status(500).json({ message: 'Error calculating monthly attendance stats.' });
  }
});

module.exports = router;