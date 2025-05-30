import getSubjectModel from "../models/subjectModel.js";
import { getTenantDb } from "../utils/getTenantDb.js";
import 'dotenv/config';

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Subject = getSubjectModel(connection);

    const { name, code, description, teachers } = req.body;
    const subject = new Subject({ name, code, description, teachers });
    await subject.save();
    res.status(201).json({ message: "Subject created successfully", subject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all subjects
const getSubjects = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Subject = getSubjectModel(connection);

    const subjects = await Subject.find()
    // .populate("teachers");
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single subject by ID
const getSubjectById = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Subject = getSubjectModel(connection);

    const subject = await Subject.findById(req.params.id)
    // .populate("teachers");
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a subject by ID
const updateSubject = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Subject = getSubjectModel(connection);

    const { name, code, description, teachers } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name, code, description, teachers },
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.status(200).json({ message: "Subject updated successfully", subject });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a subject by ID
const deleteSubject = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    // Get tenant database connection
    const connection = await getTenantDb(tenantId);
    const Subject = getSubjectModel(connection);

    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    res.status(200).json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};