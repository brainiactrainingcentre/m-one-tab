import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: Date,
  maxMarks: Number,
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment']
  }
}, {
  timestamps: true
});

// Multi-tenant model getter
const getExamModel = (connection) => {
  return connection.models.Exam || connection.model("Exam", examSchema);
};

export default getExamModel;
