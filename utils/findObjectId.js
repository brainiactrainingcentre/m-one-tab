import studentModel from '../models/studentModel.js';
import subjectModel from '../models/subjectModel.js';
import teacherModel from '../models/teacherModels.js';
import classModel from '../models/classModel.js';

const findSubjectObjectId = async (code) => {
  const subject = await subjectModel.findOne({ code });
  return subject ? subject._id : null;
};

const findStudentObjectId = async (studentId) => {
  const student = await studentModel.findOne({ studentId });
  return student ? student._id : null;
};

const findTeacherObjectId = async (employeeId) => {
  const teacher = await teacherModel.findOne({ employeeId });
  return teacher ? teacher._id : null;
};

const findClassObjectId = async (classId) => {
  const classObjectId = await classModel.findOne({ classId });
  return classObjectId ? classObjectId._id : null;
};

export  { findSubjectObjectId, findStudentObjectId, findTeacherObjectId, findClassObjectId };
