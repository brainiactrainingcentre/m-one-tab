import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetTeacherQuery,
  useUpdateTeacherMutation,
} from "@/src/redux/services/auth";
import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";
import DateField from "@/src/components/atoms/DateField";
import OptionArray from "@/src/utils/Arrays/optionArray";
import DropdownField from "@/src/components/atoms/DropdownField";

const EditTeacherScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: teacherData, isLoading: isLoadingTeacher } =
    useGetTeacherQuery(id);
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employeeId: "",
    title: "",
    gender: "",
    dateOfBirth: new Date(),
    fatherName: "",
    qualification: "",
    contactNumber: "",
    address: "",
    designation: "",
    department: "",
    staffType: "",
    professionType: "",
    joiningDate: new Date(),
    retireDate: new Date(),
    salary: "",
    maritalStatus: "",
    spouseName: "",
    spouseContactNumber: "",
    aadharNumber: "",
    panNumber: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    userId: "",
    subjects: [],
    classes: [],
  });

  const [errors, setErrors] = useState({});

  // Add this helper function to map backend values to dropdown options
  const mapBackendValueToOption = (backendValue, optionsArray) => {
    if (!backendValue || !optionsArray) return "";
    
    // Try to find exact match first (case-insensitive)
    const exactMatch = optionsArray.find(
      opt => opt.value?.toLowerCase() === backendValue.toLowerCase() || 
            opt.label?.toLowerCase() === backendValue.toLowerCase()
    );
    if (exactMatch) return exactMatch.value;
    
    // Try to find partial match
    const partialMatch = optionsArray.find(
      opt => backendValue.toLowerCase().includes(opt.value?.toLowerCase()) || 
            opt.value?.toLowerCase().includes(backendValue.toLowerCase())
    );
    return partialMatch ? partialMatch.value : "";
  };

  useEffect(() => {
    if (teacherData?.data) {
      const teacher = teacherData.data;
      
      // Log the incoming data for debugging
      console.log("Backend data:", {
        designation: teacher.designation,
        department: teacher.department,
        professionType: teacher.professionType,
        title: teacher.title,
        staffType: teacher.staffType
      });
      
      // Log option arrays for comparison
      console.log("Options:", {
        designationOptions: OptionArray.designationTypeOption,
        departmentOptions: OptionArray.staffDepartmentOptions,
        professionTypeOptions: OptionArray.professionTypeOptions,
        titleOptions: OptionArray.titileOptions,
        staffTypeOptions: OptionArray.staffTypeOptions
      });

      setFormData({
        name: teacher.userId?.name || "",
        email: teacher.userId.email,
        employeeId: teacher.employeeId,
        // Map backend values to dropdown options using the helper function
        title: mapBackendValueToOption(teacher.title, OptionArray.titileOptions),
        gender: mapBackendValueToOption(teacher.gender, OptionArray.genderOptions),
        dateOfBirth: teacher.dateOfBirth
          ? new Date(teacher.dateOfBirth)
          : new Date(),
        fatherName: teacher.fatherName || "",
        qualification: teacher.qualification || "",
        contactNumber: teacher.contactNumber || "",
        address: teacher.address || "",
        designation: mapBackendValueToOption(teacher.designation, OptionArray.designationTypeOption),
        department: mapBackendValueToOption(teacher.department, OptionArray.staffDepartmentOptions),
        staffType: mapBackendValueToOption(teacher.staffType, OptionArray.staffTypeOptions),
        professionType: mapBackendValueToOption(teacher.professionType, OptionArray.professionTypeOptions),
        joiningDate: teacher.joiningDate
          ? new Date(teacher.joiningDate)
          : new Date(),
        retireDate: teacher.retireDate
          ? new Date(teacher.retireDate)
          : new Date(),
        salary: teacher.salary ? teacher.salary.toString() : "",
        maritalStatus: mapBackendValueToOption(teacher.maritalStatus, OptionArray.maritalStatusOptions),
        spouseName: teacher.spouseName || "",
        spouseContactNumber: teacher.spouseContactNumber || "",
        aadharNumber: teacher.aadharNumber || "",
        panNumber: teacher.panNumber || "",
        accountNumber: teacher.accountNumber || "",
        ifscCode: teacher.ifscCode || "",
        bankName: teacher.bankName || "",
        userId: teacher.userId._id,
        subjects: teacher.subjects || [],
        classes: teacher.classes || [],
      });
    }
  }, [teacherData]);

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Format date as YYYY-MM-DD
  const formatDateToYYYYMMDD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.employeeId.trim())
      newErrors.employeeId = "Employee ID is required";
    if (!formData.qualification.trim())
      newErrors.qualification = "Qualification is required";
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.salary) {
      newErrors.salary = "Salary is required";
    } else if (isNaN(formData.salary) || Number(formData.salary) <= 0) {
      newErrors.salary = "Salary must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Get original values for dropdown fields to send to backend
  const getOriginalValueForDropdown = (selectedValue, optionsArray) => {
    if (!selectedValue || !optionsArray) return "";
    
    const option = optionsArray.find(opt => opt.value === selectedValue);
    // Return either the original label or the value itself if no match
    return option ? option.label : selectedValue;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Create payload with the correct structure for the backend
      const payload = {
        id: id,
        name: formData.name,
        email: formData.email,
        employeeId: formData.employeeId,
        // Convert dropdown values back to their original format for backend
        title: getOriginalValueForDropdown(formData.title, OptionArray.titileOptions),
        gender: getOriginalValueForDropdown(formData.gender, OptionArray.genderOptions),
        dateOfBirth: formatDateToYYYYMMDD(formData.dateOfBirth),
        fatherName: formData.fatherName,
        qualification: formData.qualification,
        contactNumber: formData.contactNumber,
        address: formData.address,
        designation: getOriginalValueForDropdown(formData.designation, OptionArray.designationTypeOption),
        department: getOriginalValueForDropdown(formData.department, OptionArray.staffDepartmentOptions),
        staffType: getOriginalValueForDropdown(formData.staffType, OptionArray.staffTypeOptions),
        professionType: getOriginalValueForDropdown(formData.professionType, OptionArray.professionTypeOptions),
        joiningDate: formatDateToYYYYMMDD(formData.joiningDate),
        retireDate: formatDateToYYYYMMDD(formData.retireDate),
        salary: Number(formData.salary),
        maritalStatus: getOriginalValueForDropdown(formData.maritalStatus, OptionArray.maritalStatusOptions),
        spouseName: formData.spouseName,
        spouseContactNumber: formData.spouseContactNumber,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankName: formData.bankName,
        // Make sure we're sending the original subjects and classes
        subjects: formData.subjects.map((subject) => subject._id || subject),
        classes: formData.classes.map((cls) => cls._id || cls),
      };

      console.log("Submitting update payload:", payload);

      const result = await updateTeacher(payload).unwrap();
      console.log("Update result:", result);

      Alert.alert("Success", "Teacher information updated successfully");
      router.back();
    } catch (error) {
      console.error("Failed to update teacher:", error);
      Alert.alert(
        "Error",
        error.data?.message || "Failed to update teacher information"
      );
    }
  };

  if (isLoadingTeacher) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-4 text-base text-gray-600">
          Loading teacher information...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text className="text-xl font-bold">Edit Teacher</Text>
      </View>

      <View className="p-4">
        {/* Personal Information Section */}
        <Text className="font-pbold text-[18px] mt-3 mb-5">
          Basic Information
        </Text>

        {/* Gender and Title Fields */}
        <View className="flex-row justify-between py-1">
          <View className="w-[25%]">
            <DropdownField
              name="title"
              options={OptionArray.titileOptions}
              value={formData.title}
              onValueChange={(value) => handleChange("title")(value)}
              placeholder="Select title"
              labelName="Title"
              error={errors.title}
            />
          </View>
          <View className="w-[70%]">
            <InputField
              name="name"
              value={formData.name}
              onChangeText={handleChange("name")}
              placeholder="Enter full name"
              labelName="Full Name"
              error={errors.name}
              style={{ color: "black" }}
            />
          </View>
        </View>

        <InputField
          name="email"
          value={formData.email}
          onChangeText={handleChange("email")}
          placeholder="Enter email"
          labelName="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          style={{ color: "black" }}
        />
        {/* Personal Information Section */}
        <Text className="font-pbold text-[18px] mt-2 mb-5">
          Personal Information
        </Text>
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <InputField
              name="qualification"
              value={formData.qualification}
              onChangeText={handleChange("qualification")}
              placeholder="Enter qualification"
              labelName="Qualification"
              error={errors.qualification}
              style={{ color: "black" }}
            />
          </View>
          <View className="w-[48%]">
            <DropdownField
              name="gender"
              options={OptionArray.genderOptions}
              value={formData.gender}
              onValueChange={(value) => handleChange("gender")(value)}
              placeholder="Select gender"
              labelName="Gender"
              error={errors.gender}
            />
          </View>
        </View>
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <DateField
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(date) => handleChange("dateOfBirth")(date)}
              error={errors.dateOfBirth}
              formatDate={formatDateToYYYYMMDD}
            />
          </View>
          <View className="w-[48%]">
            <InputField
              name="fatherName"
              value={formData.fatherName}
              onChangeText={handleChange("fatherName")}
              placeholder="Enter father's name"
              labelName="Father's Name"
              error={errors.fatherName}
              style={{ color: "black" }}
            />
          </View>
        </View>

        {/* Contact Information Section */}
        <Text className="font-pbold text-[18px] mt-2 mb-5">
          Contact Information
        </Text>
        {/* Address */}
        <InputField
          name="address"
          value={formData.address}
          onChangeText={handleChange("address")}
          placeholder="Enter address"
          labelName="Address"
          multiline
          numberOfLines={3}
          error={errors.address}
          style={{ color: "black", textAlignVertical: "top" }}
        />

        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <InputField
              name="spouseContactNumber"
              value={formData.spouseContactNumber}
              onChangeText={handleChange("spouseContactNumber")}
              placeholder="Enter spouse's contact"
              labelName="Spouse Contact Number"
              keyboardType="phone-pad"
              error={errors.spouseContactNumber}
              style={{ color: "black" }}
              editable={formData.maritalStatus === "Married"}
            />
          </View>
          <View className="w-[48%]">
            <InputField
              name="contactNumber"
              value={formData.contactNumber}
              onChangeText={handleChange("contactNumber")}
              placeholder="Enter contact number"
              labelName="Contact Number"
              keyboardType="phone-pad"
              error={errors.contactNumber}
              style={{ color: "black" }}
            />
          </View>
        </View>

        {/* Professional Information Section */}
        <Text className="font-pbold text-[18px] mt-3 mb-5">
          Professional Information
        </Text>

        {/* Designation and Department */}
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <DropdownField
              name="designation"
              options={OptionArray.designationTypeOption}
              value={formData.designation}
              onValueChange={(value) => handleChange("designation")(value)}
              placeholder="Enter designation"
              labelName="Designation"
              error={errors.designation}
            />
          </View>
          <View className="w-[48%]">
            <DropdownField
              name="department"
              options={OptionArray.staffDepartmentOptions}
              value={formData.department}
              onValueChange={(value) => handleChange("department")(value)}
              placeholder="Enter department"
              labelName="Department"
              error={errors.department}
            />
          </View>
        </View>
        {/* Staff Type and Profession Type */}
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <DropdownField
              name="staffType"
              options={OptionArray.staffTypeOptions}
              value={formData.staffType}
              onValueChange={(value) => handleChange("staffType")(value)}
              placeholder="Select staff type"
              labelName="Staff Type"
              error={errors.staffType}
            />
          </View>
          <View className="w-[48%]">
            <DropdownField
              name="professionType"
              options={OptionArray.professionTypeOptions}
              value={formData.professionType}
              onValueChange={(value) => handleChange("professionType")(value)}
              placeholder="Select profession type"
              labelName="Profession Type"
              error={errors.professionType}
            />
          </View>
        </View>

        {/* Employee ID and Qualification */}
        <View className="flex-row justify-between"></View>

        {/* Joining Date and Retirement Date */}
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <DateField
              label="Joining Date"
              value={formData.joiningDate}
              onChange={(date) => handleChange("joiningDate")(date)}
              error={errors.joiningDate}
              formatDate={formatDateToYYYYMMDD}
            />
          </View>
          <View className="w-[48%]">
            <DateField
              label="Retirement Date"
              value={formData.retireDate}
              onChange={(date) => handleChange("retireDate")(date)}
              error={errors.retireDate}
              formatDate={formatDateToYYYYMMDD}
            />
          </View>
        </View>

        {/* Salary */}
        <View className="flex-row">
          <View className="w-[48%]">
            <InputField
              name="salary"
              value={formData.salary}
              onChangeText={handleChange("salary")}
              placeholder="Enter salary"
              labelName="Salary"
              keyboardType="numeric"
              error={errors.salary}
              style={{ color: "black" }}
            />
          </View>
        </View>

        {/* Identity Information Section */}
        <Text className="font-pbold text-[18px] mt-3 mb-5">
          Identity Information
        </Text>

        {/* Aadhar and PAN */}
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <InputField
              name="aadharNumber"
              value={formData.aadharNumber}
              onChangeText={handleChange("aadharNumber")}
              placeholder="Enter Aadhar number"
              labelName="Aadhar Number"
              keyboardType="numeric"
              error={errors.aadharNumber}
              style={{ color: "black" }}
            />
          </View>
          <View className="w-[48%]">
            <InputField
              name="panNumber"
              value={formData.panNumber}
              onChangeText={handleChange("panNumber")}
              placeholder="Enter PAN number"
              labelName="PAN Number"
              autoCapitalize="characters"
              error={errors.panNumber}
              style={{ color: "black" }}
            />
          </View>
        </View>

        {/* Bank Details Section */}
        <Text className="font-pbold text-[18px] mt-3 mb-5">
          Marital Details
        </Text>
        {/* Marital Status and Spouse Details */}
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <DropdownField
              name="maritalStatus"
              options={OptionArray.maritalStatusOptions}
              value={formData.maritalStatus}
              onValueChange={(value) => handleChange("maritalStatus")(value)}
              placeholder="Select marital status"
              labelName="Marital Status"
              error={errors.maritalStatus}
            />
          </View>
          <View className="w-[48%]">
            <InputField
              name="spouseName"
              value={formData.spouseName}
              onChangeText={handleChange("spouseName")}
              placeholder="Enter spouse's name"
              labelName="Spouse Name"
              error={errors.spouseName}
              style={{ color: "black" }}
              editable={formData.maritalStatus === "Married"}
            />
          </View>
        </View>
        <Text className="font-pbold text-[18px] mt-3 mb-5">Bank Details</Text>

        {/* Bank Name and Account Number */}
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <InputField
              name="bankName"
              value={formData.bankName}
              onChangeText={handleChange("bankName")}
              placeholder="Enter bank name"
              labelName="Bank Name"
              error={errors.bankName}
              style={{ color: "black" }}
            />
          </View>
          <View className="w-[48%]">
            <InputField
              name="accountNumber"
              value={formData.accountNumber}
              onChangeText={handleChange("accountNumber")}
              placeholder="Enter account number"
              labelName="Account Number"
              keyboardType="numeric"
              error={errors.accountNumber}
              style={{ color: "black" }}
            />
          </View>
        </View>

        {/* IFSC Code */}
        <View className="flex-row">
          <View className="w-[48%]">
            <InputField
              name="ifscCode"
              value={formData.ifscCode}
              onChangeText={handleChange("ifscCode")}
              placeholder="Enter IFSC code"
              labelName="IFSC Code"
              autoCapitalize="characters"
              error={errors.ifscCode}
              style={{ color: "black" }}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View className="mt-8 mb-8">
          <MyButton
            title={isUpdating ? "Updating..." : "Update Teacher"}
            onPress={handleSubmit}
            disabled={isUpdating}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default EditTeacherScreen;