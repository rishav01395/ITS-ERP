const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/college_erp';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Base Route
app.get('/', (req, res) => {
  res.send({ message: 'College ERP Backend is Running Successfully!' });
});

// Import Auth Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Import Attendance Routes
const attendanceRoutes = require('./routes/attendance');
app.use('/api/attendance', attendanceRoutes);


// Import Fee Routes
const feeRoutes = require('./routes/fee');
app.use('/api/fee', feeRoutes);
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});