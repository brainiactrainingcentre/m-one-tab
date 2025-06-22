import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['tuition', 'transport', 'library', 'monthly', 'other'],
    default: 'monthly'
  },
  month: {
    type: String, // Format: 'YYYY-MM' (e.g., '2025-06')
    required: function () {
      return this.type === 'monthly';
    }
  },
  dueDate: Date,

  // ✅ New fields for payment tracking
  paidAmount: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: function () {
      return this.amount;
    }
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue'],
    default: 'pending'
  },

  // ✅ Optional payment info
  paymentDate: Date,
  paymentMethod: String,
  transactionId: String
}, {
  timestamps: true
});

// ✅ Multi-tenant model getter
const getFeeModel = (connection) => {
  return connection.models.Fee || connection.model("Fee", feeSchema);
};

export default getFeeModel;
