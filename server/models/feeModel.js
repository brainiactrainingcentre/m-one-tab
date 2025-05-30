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
    enum: ['tuition', 'transport', 'library', 'other']
  },
  dueDate: Date,
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  paymentDate: Date,
  paymentMethod: String,
  transactionId: String
}, {
  timestamps: true
});

// Multi-tenant model getter
const getFeeModel = (connection) => {
  return connection.models.Fee || connection.model("Fee", feeSchema);
};

export default getFeeModel;
