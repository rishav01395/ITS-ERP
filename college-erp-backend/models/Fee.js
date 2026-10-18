const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: { type: String, required: true }, // e.g., "2026-2027"
  totalFee: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Partial'],
    default: 'Pending'
  },
  paymentHistory: [
    {
      amountPaid: { type: Number, required: true },
      paymentDate: { type: Date, default: Date.now },
      paymentMode: { type: String, enum: ['Online', 'Cash', 'UPI', 'Bank Transfer'], default: 'Online' },
      transactionId: { type: String, required: true },
      receiptNumber: { type: String, required: true },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin/Cashier ID
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);