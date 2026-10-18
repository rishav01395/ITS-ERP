const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const CourseFee = require('../models/CourseFee');
const Notice = require('../models/Notice');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { randomBytes } = require('crypto');
const verifyToken = require('../middleware/verifyToken'); // path apne project ke anusaar dekh lena
const allowedRoles = ['admin', 'staff', 'teacher', 'student'];

// 1. REGISTER / ADD USER (Admin or Staff can add Teachers/Students)
router.post('/register', async (req, res) => {
  try {
    const { name, email, role, department, semester, rollNo, mobileNumber, password } = req.body || {};
    const normalizedName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const normalizedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';

    if (!normalizedName || !normalizedEmail || !normalizedRole) {
      return res.status(400).json({ message: 'Name, email, and role are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(', ')}.` });
    }

    for (const [field, value] of Object.entries({ department, semester, rollNo })) {
      if (value !== undefined && typeof value !== 'string') {
        return res.status(400).json({ message: `${field} must be a string.` });
      }
    }

    if (mobileNumber !== undefined && typeof mobileNumber !== 'string') {
      return res.status(400).json({ message: 'mobileNumber must be a string.' });
    }

    if (password !== undefined && (typeof password !== 'string' || password.length < 6)) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedRollNo = typeof rollNo === 'string' ? rollNo.trim() : undefined;
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database unavailable. Start MongoDB or check MONGO_URI in the backend .env file.'
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        ...(normalizedRollNo ? [{ rollNo: normalizedRollNo }] : [])
      ]
    });
    if (existingUser) {
      return res.status(400).json({
        message: 'Roll Number or Email is already registered. Please use a unique Roll Number or Login.'
      });
    }

    const tempPassword = password === undefined ? `ERP@${randomBytes(8).toString('hex')}` : undefined;
    const hashedPassword = await bcrypt.hash(password || tempPassword, 10);

    // Dynamic Course Fee Lookup for Students
    let assignedTotalFee = 0;
    if (normalizedRole === 'student' && department) {
      const courseData = await CourseFee.findOne({ courseName: department.trim().toUpperCase() });
      assignedTotalFee = courseData ? courseData.annualFee : 100000; // Fallback to 100000 if fee structure not set
    }

    const newUser = new User({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      department: typeof department === 'string' ? department.trim() : undefined,
      semester: typeof semester === 'string' ? semester.trim() : undefined,
      mobileNumber: typeof mobileNumber === 'string' ? mobileNumber.trim() : undefined,
      rollNo: normalizedRollNo || undefined,
      totalFees: assignedTotalFee,
      paidFees: 0,
      isFirstLogin: true
    });

    await newUser.save();

    let emailSent = false;
    let emailMessage = 'Email was not sent because EMAIL_USER or EMAIL_PASS is not configured.';
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: 'Welcome to ITS ERP',
        text: password === undefined
          ? `Hello ${normalizedName},\n\nYour account has been created on the ITS ERP portal.\n\nYour login credentials:\nEmail: ${normalizedEmail}\nTemporary Password: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nRegards,\nITS Engineering College`
          : `Hello ${normalizedName},\n\nYour ITS ERP account has been created. You can sign in using your registered email and the password you chose during registration.\n\nRegards,\nITS Engineering College`
      };

      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
        emailMessage = 'Credentials were sent by email.';
      } catch (emailError) {
        console.error('Registration email delivery failed:', emailError);
        emailMessage = 'The account was created, but credential email delivery failed.';
      }
    }

    return res.status(201).json({
      message: 'User registered successfully.',
      emailSent,
      emailMessage,
      ...(tempPassword ? { tempPassword } : {})
    });

  } catch (error) {
    console.error('Registration Error:', error);

    if (error && ['MongooseServerSelectionError', 'MongoNetworkError', 'MongoNotConnectedError'].includes(error.name)) {
      return res.status(503).json({ message: 'Database unavailable. Check MongoDB and MONGO_URI.' });
    }

    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Roll Number or Email is already registered.' });
    }

    res.status(500).json({ message: 'Server error during registration' });
  }
});

// 2. LOGIN API
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Email or Password!' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Email or Password!' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET || 'supersecretkeycollegeerp12345',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login Successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        isFirstLogin: user.isFirstLogin
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// 3. CHANGE PASSWORD API
router.post('/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.isFirstLogin = false;

    await user.save();

    res.json({ message: 'Password changed successfully! You can now log in with your new password.' });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error during password change.' });
  }
});

// 4. ADMIN: SET / UPDATE COURSE FEE
router.post('/set-course-fee', async (req, res) => {
  try {
    const { courseName, department, annualFee } = req.body;
    if (!courseName || !annualFee) {
      return res.status(400).json({ message: 'Course name and annual fee are required.' });
    }

    const course = await CourseFee.findOneAndUpdate(
      { courseName: courseName.toUpperCase() },
      { department, annualFee: Number(annualFee) },
      { new: true, upsert: true }
    );

    res.json({ message: `Fee structure for ${courseName} set to ₹${annualFee}`, course });
  } catch (err) {
    console.error('Set Course Fee Error:', err);
    res.status(500).json({ message: 'Failed to update course fee.' });
  }
});

// 5. GET ALL COURSE FEES
router.get('/course-fees', async (req, res) => {
  try {
    const fees = await CourseFee.find();
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course fees.' });
  }
});

// 6. ADMIN: COLLECT / UPDATE STUDENT FEE & SEND RECEIPT
router.post('/update-student-fee', async (req, res) => {
  try {
    const { studentId, amountPaid } = req.body;
    if (!studentId || !amountPaid) {
      return res.status(400).json({ message: 'Student ID and amount paid are required.' });
    }

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student not found.' });
    }

    student.paidFees = (student.paidFees || 0) + Number(amountPaid);
    await student.save();

    const remainingFees = (student.totalFees || 0) - student.paidFees;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Official Fee Receipt - ITS Engineering College',
        html: `
          <h2>Fee Payment Receipt</h2>
          <p>Dear <b>${student.name}</b>,</p>
          <p>We have received your fee payment of <b>₹${amountPaid}</b>.</p>
          <ul>
            <li><b>Total Course Fees:</b> ₹${student.totalFees || 0}</li>
            <li><b>Total Paid Amount:</b> ₹${student.paidFees}</li>
            <li><b>Remaining Due Balance:</b> ₹${remainingFees}</li>
          </ul>
          <p>Thank you for your payment.</p>
          <br/>
          <p>Regards,<br/>Accounts Department<br/>ITS Engineering College</p>
        `
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({
      message: 'Fee updated successfully and receipt emailed to student.',
      paidFees: student.paidFees,
      remainingFees
    });

  } catch (err) {
    console.error('Update Fee Error:', err);
    res.status(500).json({ message: 'Failed to update student fee.' });
  }
});

// 7. ADMIN: ADD NOTICE / HOLIDAY / EXAM
router.post('/add-notice', async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const newNotice = new Notice({ title, content, category });
    await newNotice.save();
    res.status(201).json({ message: 'Notice published successfully!', notice: newNotice });
  } catch (err) {
    res.status(500).json({ message: 'Failed to publish notice.' });
  }
});

// 8. GET ALL NOTICES
router.get('/notices', async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notices.' });
  }
});
// Update User Profile & Documents
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { profilePhoto, aadhaarNo, marks10th, marks12th, mobileNumber, address } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto, aadhaarNo, marks10th, marks12th, mobileNumber, address },
      { new: true }
    ).select('-password');

    res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
});
// GET /api/auth/students?department=Computer Science&semester=3&section=A
router.get('/students', verifyToken, async (req, res) => {
  try {
    const { department, semester, section } = req.query;
    
    // Filter object based on query params
    let filter = { role: 'student' };
    if (department) filter.department = department;
    if (semester) filter.semester = semester;
    if (section) filter.section = section;

    const students = await User.find(filter).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});
// PUT /api/auth/update-fee
router.put('/update-fee', verifyToken, async (req, res) => {
  try {
    const { studentId, totalFees, paidFees } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      studentId,
      { 
        totalFees: Number(totalFees), 
        paidFees: Number(paidFees) 
      },
      { new: true }
    ).select('-password');

    res.json({ 
      message: 'Fee status updated successfully', 
      user: updatedUser 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating fee records', error: error.message });
  }
});
module.exports = router;