import * as Yup from "yup";

const TeacherSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
  employeeId: Yup.string().required("Employee ID is required"),

  // Personal Information
  title: Yup.string().required("title is required"),
  gender: Yup.string(),
  dateOfBirth: Yup.date().typeError("Invalid date format (YYYY-MM-DD)"),
  fatherName: Yup.string(),
  qualification: Yup.string(),

  // Contact Information
  contactNumber: Yup.string().required("Contact number is required"),
  address: Yup.string().required("Address is required"),

  // Professional Information
  designation: Yup.string(),
  department: Yup.string(),
  staffType: Yup.string(),
  professionType: Yup.string(),
  joiningDate: Yup.date()
    .typeError("Invalid date format (YYYY-MM-DD)")
    .required("Joining date is required"),
  retireDate: Yup.date().typeError("Invalid date format (YYYY-MM-DD)"),
  salary: Yup.number()
    .positive("Salary must be a positive number"),

  // Marital Information
  maritalStatus: Yup.string(),
  spouseName: Yup.string(),
  spouseContactNumber: Yup.string(),

  // ID Information
  aadharNumber: Yup.string(),
  panNumber: Yup.string(),

  // Bank Details
  accountNumber: Yup.string(),
  ifscCode: Yup.string(),
  bankName: Yup.string(),

  // References
  subjectsCode: Yup.array().of(
    Yup.string()
  ),
  classCode: Yup.array().of(Yup.string()),
});


// Student Schema
const StudentSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    rollNumber: Yup.string().required("Roll number is required"),
    dateOfBirth: Yup.date().typeError("Invalid date format (YYYY-MM-DD)"),
    gender: Yup.string(),
    address: Yup.string().required("Address is required"),
    contactNumber: Yup.string().required("Contact number is required"),
    fatherName: Yup.string(),
    classCode: Yup.string().required("Class code is required"),
    section: Yup.string(),
  });
  
  export default {
    TeacherSchema,
    StudentSchema,
  };
  


