import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  marksObtained: Number,
  remarks: String,
  grade: String
}, {
  timestamps: true
});

// Multi-tenant model getter
const getResultModel = (connection) => {
  return connection.models.Result || connection.model("Result", resultSchema);
};

export default getResultModel;