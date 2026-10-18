const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const verifyToken = require('../middleware/verifyToken'); // Tera existing JWT middleware

// ==========================================
// 1. STUDENT ROUTES
// ==========================================

// Student: View own Fee Details & Pending Status
router.get('/my-fees', verifyToken, async (req, res) => {
  try {
    const feeRecord = await Fee.findOne({ studentId: req.user.id })
      .populate('studentId', 'name email rollNumber department semester');
      
    if (!feeRecord) {
      return res.status(404).json({ message: 'Fee details not found for this student.' });
    }

    res.json(feeRecord);
  } catch (error) {
    console.error('Fetch Fee Error:', error);
    res.status(500).json({ message: 'Server error while fetching fee record.' });
  }
});

// Student: Pay Now (Online Payment Simulation / Integration)
router.post('/pay-now', verifyToken, async (req, res) => {
  try {
    const { amount, paymentMode, transactionId } = req.body;

    let feeRecord = await Fee.findOne({ studentId: req.user.id });
    if (!feeRecord) return res.status(404).json({ message: 'Fee record not found.' });

    const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
    const paidAmt = Number(amount);

    feeRecord.paidAmount += paidAmt;
    feeRecord.pendingAmount = Math.max(0, feeRecord.totalFee - feeRecord.paidAmount);
    
    if (feeRecord.pendingAmount === 0) {
      feeRecord.status = 'Paid';
    } else {
      feeRecord.status = 'Partial';
    }

    feeRecord.paymentHistory.push({
      amountPaid: paidAmt,
      paymentMode: paymentMode || 'Online',
      transactionId: transactionId || `TXN${Date.now()}`,
      receiptNumber: receiptNo
    });

    await feeRecord.save();
    res.status(200).json({ 
      message: 'Payment successful! Receipt generated.', 
      receiptNumber: receiptNo,
      data: feeRecord 
    });
  } catch (error) {
    console.error('Pay Fee Error:', error);
    res.status(500).json({ message: 'Server error while processing payment.' });
  }
});

// ==========================================
// 2. ADMIN ROUTES
// ==========================================

// Admin: Set or Update Fee Structure for a Student
router.post('/set-structure', verifyToken, async (req, res) => {
  try {
    const { studentId, academicYear, totalFee } = req.body;

    let feeRecord = await Fee.findOne({ studentId, academicYear });
    
    if (feeRecord) {
      feeRecord.totalFee = totalFee;
      feeRecord.pendingAmount = totalFee - feeRecord.paidAmount;
    } else {
      feeRecord = new Fee({
        studentId,
        academicYear,
        totalFee,
        pendingAmount: totalFee
      });
    }

    await feeRecord.save();
    res.status(201).json({ message: 'Fee structure updated successfully!', data: feeRecord });
  } catch (error) {
    console.error('Set Fee Structure Error:', error);
    res.status(500).json({ message: 'Server error setting fee structure.' });
  }
});

// Admin: Manual Offline Fee Update (Cash/DD Entry & Receipt Issue)
router.post('/admin-update', verifyToken, async (req, res) => {
  try {
    const { studentId, amountPaid, paymentMode, transactionId } = req.body;

    let feeRecord = await Fee.findOne({ studentId });
    if (!feeRecord) return res.status(404).json({ message: 'Fee record not found for this student.' });

    const receiptNo = `REC-ADM-${Date.now().toString().slice(-6)}`;
    const paidAmt = Number(amountPaid);

    feeRecord.paidAmount += paidAmt;
    feeRecord.pendingAmount = Math.max(0, feeRecord.totalFee - feeRecord.paidAmount);
    feeRecord.status = feeRecord.pendingAmount === 0 ? 'Paid' : 'Partial';

    feeRecord.paymentHistory.push({
      amountPaid: paidAmt,
      paymentMode: paymentMode || 'Cash',
      transactionId: transactionId || `OFFLINE-${Date.now()}`,
      receiptNumber: receiptNo,
      updatedBy: req.user.id
    });

    await feeRecord.save();
    res.status(200).json({ 
      message: 'Offline fee updated successfully! Receipt issued.', 
      receiptNumber: receiptNo,
      data: feeRecord 
    });
  } catch (error) {
    console.error('Admin Fee Update Error:', error);
    res.status(500).json({ message: 'Server error during manual fee update.' });
  }
});

module.exports = router;