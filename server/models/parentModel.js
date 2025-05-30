import mongoose from "mongoose";

const parentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }],
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters'],
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
  },
  alternateNumber: String,
  motherName: String,
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
}, {
  timestamps: true,
});

// Export as tenant-aware model getter
const getParentModel = (connection) => {
  return connection.models.Parent || connection.model('Parent', parentSchema);
};

export default getParentModel;
