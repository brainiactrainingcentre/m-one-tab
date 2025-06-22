import getClassModel from "../models/classModel.js";
import getTeacherModel from "../models/teacherModels.js";
import getStudentModel from "../models/studentModel.js";
import getSubjectModel from "../models/subjectModel.js";
import mongoose from "mongoose";
import {
  findTeacherObjectId,
  findStudentObjectId,
  findSubjectObjectId,
} from "../utils/findObjectId.js";
import { getTenantDb } from "../utils/getTenantDb.js";
import "dotenv/config";
import getUserModel from "../models/userModel.js";

// Helper function to check if ID is valid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new class
const createClass = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);
    const Teacher = getTeacherModel(connection);
    const Student = getStudentModel(connection);
    const Subject = getSubjectModel(connection);

    const {
      name,
      section,
      classTeacherId,
      studentIds,
      subjectIds,
      academicYear,
      schedule,
    } = req.body;

    // Find class teacher's ObjectId
    const classTeacher = await findTeacherObjectId(classTeacherId);

    // Find all students' ObjectIds
    const studentObjectIds = await Promise.all(
      studentIds.map((id) => findStudentObjectId(id))
    );
    // Find all subjects' ObjectIds
    const subjectObjectIds = await Promise.all(
      subjectIds.map((id) => findSubjectObjectId(id))
    );

    const processedSchedule = await Promise.all(
      schedule.map(async (day) => {
        const periods = await Promise.all(
          day.periods.map(async (period) => {
            const subjectId = await findSubjectObjectId(period.subjectId);
            const teacherId = await findTeacherObjectId(period.teacherId);
            return {
              subject: subjectId,
              teacher: teacherId,
              startTime: period.startTime,
              endTime: period.endTime,
            };
          })
        );

        return {
          day: day.day,
          periods,
        };
      })
    );

    let classId = name.replaceAll(" ", "") + section;
    const newClass = new Class({
      name,
      section,
      classId,
      classTeacher,
      students: studentObjectIds,
      subjects: subjectObjectIds,
      academicYear,
      schedule: processedSchedule,
    });
    const savedClass = await newClass.save();

    res.status(201).json({
      success: true,
      data: savedClass,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

// Get all classes with optional filters
const getClasses = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);
    getTeacherModel(connection);
    getStudentModel(connection);
    getSubjectModel(connection);
    const { academicYear, section } = req.query;
    const filter = {};

    if (academicYear) filter.academicYear = academicYear;
    if (section) filter.section = section;

    const classes = await Class.find(filter)
      .populate({
        path: "classTeacher",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .populate("subjects", "name code")
      .select("-schedule");

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single class by ID with full details
const getClassById = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);
    getTeacherModel(connection);
    getUserModel(connection);
    getStudentModel(connection);
    getSubjectModel(connection);
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const classDetails = await Class.findById(id)
      // ✅ Populate classTeacher
      .populate({
        path: "classTeacher",
        select: "employeeId userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })

      // Populate Teacher array
      .populate({
        path: "Teacher",
        select: "employeeId userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })

      // Populate schedule.periods.teacher
      .populate({
        path: "schedule.periods.teacher",
        select: "employeeId userId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })

      // Populate subjects
      .populate("subjects", "name code")

      // Populate schedule.periods.subject
      .populate("schedule.periods.subject", "name code")

      // Populate students (studentId + userId.name)
      .populate({
        path: "students",
        select: "studentId userId",
        populate: {
          path: "userId",
          select: "name",
        },
      });

    if (!classDetails) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: classDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update class details
const updateClass = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);
    getTeacherModel(connection);
    getUserModel(connection);
    getStudentModel(connection);
    getSubjectModel(connection);
    const { id } = req.params;
    const updates = { ...req.body };

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    // If classTeacherId is provided, validate and assign it
    if (updates.classTeacherId) {
      const teacher = await findTeacherObjectId(updates.classTeacherId);

      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Class teacher not found",
        });
      }

      // Set the actual teacher _id into the class
      updates.classTeacher = teacher._id;
      delete updates.classTeacherId;
    }

    const updatedClass = await Class.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate({
      path: "classTeacher",
      select: "employeeId userId",
      populate: {
        path: "userId",
        select: "name email",
      },
    });

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const deletedClass = await Class.findByIdAndDelete(id);

    if (!deletedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add student to class
const addStudent = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);

    const { classId, studentId } = req.body;

    if (!isValidObjectId(classId) || !isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class or student ID",
      });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $addToSet: { students: studentId } },
      { new: true }
    ).populate("students", "name rollNumber");

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove student from class
const removeStudent = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);

    const { classId, studentId } = req.params;

    if (!isValidObjectId(classId) || !isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class or student ID",
      });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      { $pull: { students: studentId } },
      { new: true }
    );

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update class schedule
const updateSchedule = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);

    const { id } = req.params;
    const { schedule } = req.body;

    // Validate input
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    // Validate schedule structure
    if (!schedule || !Array.isArray(schedule)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schedule format",
      });
    }

    // Process schedule with conditional ObjectId conversions
    const processedSchedule = await Promise.all(
      schedule.map(async (day) => {
        if (!day.day || !day.periods || !Array.isArray(day.periods)) {
          throw new Error(`Invalid day structure for day: ${day.day}`);
        }

        const processedPeriods = await Promise.all(
          day.periods.map(async (period) => {
            let subject, teacher;

            if (period.subjectId) {
              subject = isValidObjectId(period.subjectId)
                ? period.subjectId
                : await findSubjectObjectId(period.subjectId);
            }

            if (period.teacherId) {
              teacher = isValidObjectId(period.teacherId)
                ? period.teacherId
                : await findTeacherObjectId(period.teacherId);
            }

            return {
              subject,
              teacher,
              startTime: period.startTime,
              endTime: period.endTime,
            };
          })
        );

        return {
          day: day.day,
          periods: processedPeriods,
        };
      })
    );

    // Update the class with processed schedule
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { schedule: processedSchedule },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate({
        path: "schedule.periods.subject",
        select: "name code",
      })
      .populate({
        path: "schedule.periods.teacher",
        populate: {
          path: "userId",
          select: "name email",
        },
      });

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
      message: "Schedule updated successfully",
    });
  } catch (error) {
    console.error("Schedule update error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
      details: error.toString(),
    });
  }
};

// Update single period if needed
const updateSinglePeriod = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);

    const { id } = req.params;
    const { day, periodIndex, ...periodUpdate } = req.body;

    // Validate class ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    // Validate day and period index
    if (!day || periodIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Day and period index are required",
      });
    }

    // Prepare update fields
    const updateFields = {};

    // Handle subjectId conditionally
    if (periodUpdate.subjectId) {
      const subjectValue = isValidObjectId(periodUpdate.subjectId)
        ? periodUpdate.subjectId
        : await findSubjectObjectId(periodUpdate.subjectId);

      updateFields["schedule.$[dayFilter].periods.$[periodFilter].subject"] =
        subjectValue;
    }

    // Handle teacherId conditionally
    if (periodUpdate.teacherId) {
      const teacherValue = isValidObjectId(periodUpdate.teacherId)
        ? periodUpdate.teacherId
        : await findTeacherObjectId(periodUpdate.teacherId);

      updateFields["schedule.$[dayFilter].periods.$[periodFilter].teacher"] =
        teacherValue;
    }

    // Other fields
    if (periodUpdate.startTime) {
      updateFields["schedule.$[dayFilter].periods.$[periodFilter].startTime"] =
        periodUpdate.startTime;
    }

    if (periodUpdate.endTime) {
      updateFields["schedule.$[dayFilter].periods.$[periodFilter].endTime"] =
        periodUpdate.endTime;
    }

    // Perform update
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $set: updateFields },
      {
        new: true,
        arrayFilters: [
          { "dayFilter.day": day },
          { "periodFilter.subject": { $exists: true } },
        ],
        runValidators: true,
      }
    )
      .populate({
        path: "schedule.periods.subject",
        select: "name code",
      })
      .populate({
        path: "schedule.periods.teacher",
        select: "name email",
      });

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
      message: "Period updated successfully",
    });
  } catch (error) {
    console.error("Single period update error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
      details: error.toString(),
    });
  }
};

// Update Subjects in a Class
const updateClassSubjects = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);

    const { id } = req.params;
    const { subjectIds } = req.body;

    // Validate input
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Subject IDs must be a non-empty array",
      });
    }

    // Check if all subject IDs are valid ObjectIds
    const allAreObjectIds = subjectIds.every((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    let subjectObjectIds;
    if (!allAreObjectIds) {
      // Convert only if not valid ObjectIds
      subjectObjectIds = await Promise.all(
        subjectIds.map((subjectId) => findSubjectObjectId(subjectId))
      );
    } else {
      subjectObjectIds = subjectIds;
    }

    // Update the class
    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { $set: { subjects: subjectObjectIds } },
      {
        new: true,
        runValidators: true,
      }
    ).populate([{ path: "subjects", select: "name code" }]);

    if (!updatedClass) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedClass,
      message: "Subjects updated successfully",
    });
  } catch (error) {
    console.error("Update subjects error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Subjects from a Class
const deleteClassSubjects = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Class = getClassModel(connection);

    const { id } = req.params;
    const { subjectIds } = req.body;

    // Validate input
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Class ID is required",
      });
    }

    if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Subject IDs must be a non-empty array",
      });
    }

    // Convert subject IDs to ObjectIds
    const subjectObjectIds = await Promise.all(
      subjectIds.map((subjectId) => findSubjectObjectId(subjectId))
    );

    // Find the class
    const classToUpdate = await Class.findById(id);

    // Check if class was found
    if (!classToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    // Remove specified subjects
    classToUpdate.subjects = classToUpdate.subjects.filter(
      (subject) =>
        !subjectObjectIds.some(
          (subjectToRemove) => subjectToRemove.toString() === subject.toString()
        )
    );

    // Save the updated class
    const updatedClass = await classToUpdate.save();

    res.status(200).json({
      success: true,
      data: updatedClass,
      message: "Subjects deleted successfully",
    });
  } catch (error) {
    console.error("Delete subjects error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export default {
  getClasses,
  getClassById,
  updateClass,
  createClass,
  deleteClass,
  addStudent,
  removeStudent,
  updateSchedule,
  updateSinglePeriod,
  updateClassSubjects,
  deleteClassSubjects,
};
