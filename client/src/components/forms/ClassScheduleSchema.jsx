import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFormik } from "formik";
import * as Yup from "yup";
import InputField from "@/src/components/atoms/inputField";
import MyButton from "@/src/components/atoms/myButton";

const PeriodSchema = Yup.object().shape({
  // subjectId: Yup.string().required("Subject ID is required"),
  // teacherId: Yup.string(),
  // startTime: Yup.string().required("Start time is required"),
  // endTime: Yup.string().required("End time is required"),
});

const DayScheduleSchema = Yup.object().shape({
  // day: Yup.string().required("Day is required"),
  // periods: Yup.array().of(PeriodSchema),
});

const ClassScheduleSchema = Yup.object().shape({
  // name: Yup.string().required("Class name is required"),
  // section: Yup.string().required("Section is required"),
  classTeacherId: Yup.string(),
  // studentIds: Yup.array().of(Yup.string()),
  // subjectIds: Yup.array().of(Yup.string().required("Subject ID is required")),
  // academicYear: Yup.string().required("Academic year is required"),
  // schedule: Yup.array().of(DayScheduleSchema),
});

const initialValues = {
  name: "",
  section: "",
  classTeacherId: "",
  studentIds: [],
  subjectIds: [""],
  academicYear: "",
  schedule: [
    {
      day: "Monday",
      periods: [
        {
          subjectId: "",
          teacherId: "",
          startTime: "09:00",
          endTime: "10:00",
        },
      ],
    },
  ],
};

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const ClassScheduleForm = () => {
  const [selectedDay, setSelectedDay] = useState(0);

  // You can use createClassSchedule mutation if you have it
  // const [createClassSchedule] = useCreateClassScheduleMutation();

  const { values, errors, handleChange, handleSubmit, setFieldValue, resetForm } = useFormik({
    initialValues,
    validationSchema: ClassScheduleSchema,
    onSubmit: async (values) => {
      // If you have the mutation, use it
      // await createClassSchedule(values);
      console.log("Submitted Values:", values);
      resetForm();
    },
  });

  const handleSubjectIdsChange = (index) => (value) => {
    const newSubjectIds = [...values.subjectIds];
    newSubjectIds[index] = value;
    setFieldValue("subjectIds", newSubjectIds);
  };

  const handleAddSubjectId = () => {
    setFieldValue("subjectIds", [...values.subjectIds, ""]);
  };

  const handleAddDay = () => {
    if (values.schedule.findIndex(s => s.day === days[values.schedule.length]) === -1) {
      setFieldValue("schedule", [
        ...values.schedule,
        {
          day: days[values.schedule.length % days.length],
          periods: [
            {
              subjectId: "",
              teacherId: "",
              startTime: "09:00",
              endTime: "10:00",
            },
          ],
        },
      ]);
      setSelectedDay(values.schedule.length);
    }
  };

  const handlePeriodChange = (dayIndex, periodIndex, field) => (value) => {
    const newSchedule = [...values.schedule];
    newSchedule[dayIndex].periods[periodIndex][field] = value;
    setFieldValue("schedule", newSchedule);
  };

  const handleAddPeriod = (dayIndex) => {
    const newSchedule = [...values.schedule];
    const lastPeriod = newSchedule[dayIndex].periods[newSchedule[dayIndex].periods.length - 1];
    
    // Calculate next period times (1 hour later)
    const lastEndTimeParts = lastPeriod.endTime.split(':');
    let nextStartHour = parseInt(lastEndTimeParts[0]);
    let nextStartMinute = lastEndTimeParts[1];
    let nextEndHour = nextStartHour + 1;
    
    // Format times
    const nextStartTime = `${nextStartHour.toString().padStart(2, '0')}:${nextStartMinute}`;
    const nextEndTime = `${nextEndHour.toString().padStart(2, '0')}:${nextStartMinute}`;
    
    newSchedule[dayIndex].periods.push({
      subjectId: "",
      teacherId: "",
      startTime: nextStartTime,
      endTime: nextEndTime,
    });
    setFieldValue("schedule", newSchedule);
  };

  const handleRemovePeriod = (dayIndex, periodIndex) => {
    if (values.schedule[dayIndex].periods.length > 1) {
      const newSchedule = [...values.schedule];
      newSchedule[dayIndex].periods.splice(periodIndex, 1);
      setFieldValue("schedule", newSchedule);
    }
  };

  const handleRemoveDay = (dayIndex) => {
    if (values.schedule.length > 1) {
      const newSchedule = [...values.schedule];
      newSchedule.splice(dayIndex, 1);
      setFieldValue("schedule", newSchedule);
      if (selectedDay >= newSchedule.length) {
        setSelectedDay(newSchedule.length - 1);
      }
    }
  };

  return (
    <SafeAreaView className="bg-white flex-1">
      <ScrollView>
        <View className="p-4">
          <Text className="text-xl font-bold mb-4">Class Schedule Information</Text>
          
          {/* Basic class information */}
          <View className="mb-4">
            <InputField
              name="name"
              value={values.name}
              onChangeText={handleChange("name")}
              placeholder="Enter class name"
              labelName="Class Name"
              error={errors.name}
              style={{ color: "black" }}
            />
            <InputField
              name="section"
              value={values.section}
              onChangeText={handleChange("section")}
              placeholder="Enter section"
              labelName="Section"
              error={errors.section}
              style={{ color: "black" }}
            />
            <InputField
              name="classTeacherId"
              value={values.classTeacherId}
              onChangeText={handleChange("classTeacherId")}
              placeholder="Enter class teacher ID"
              labelName="Class Teacher ID"
              error={errors.classTeacherId}
              style={{ color: "black" }}
            />
            <InputField
              name="academicYear"
              value={values.academicYear}
              onChangeText={handleChange("academicYear")}
              placeholder="Enter academic year (e.g., 2024-2025)"
              labelName="Academic Year"
              error={errors.academicYear}
              style={{ color: "black" }}
            />
          </View>

          {/* Subject IDs */}
          <View className="mb-4">
            <Text className="text-lg font-bold mb-2">Subject IDs</Text>
            {values.subjectIds.map((subjectId, index) => (
              <InputField
                key={`subject-${index}`}
                name={`subjectIds-${index}`}
                value={subjectId}
                onChangeText={handleSubjectIdsChange(index)}
                placeholder={`Enter subject ID ${index + 1}`}
                labelName={`Subject ID ${index + 1}`}
                error={errors.subjectIds && errors.subjectIds[index]}
                style={{ color: "black" }}
              />
            ))}
            <MyButton
              title="Add Subject ID"
              onPress={handleAddSubjectId}
              className="mt-2"
            />
          </View>

          {/* Schedule */}
          <View className="mb-4">
            <Text className="text-lg font-bold mb-2">Schedule</Text>
            
            {/* Day tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {values.schedule.map((daySchedule, dayIndex) => (
                <TouchableOpacity
                  key={`day-tab-${dayIndex}`}
                  onPress={() => setSelectedDay(dayIndex)}
                  className={`py-2 px-4 mr-2 rounded-md ${
                    selectedDay === dayIndex ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`${
                      selectedDay === dayIndex ? "text-white" : "text-black"
                    } font-medium`}
                  >
                    {daySchedule.day}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                onPress={handleAddDay}
                className="py-2 px-4 mr-2 rounded-md bg-green-500"
              >
                <Text className="text-white font-medium">+ Add Day</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Selected day periods */}
            {values.schedule.length > 0 && selectedDay < values.schedule.length && (
              <View className="border rounded-md p-3 mb-2">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-semibold">
                    {values.schedule[selectedDay].day} Schedule
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleRemoveDay(selectedDay)}
                    className="bg-red-500 py-1 px-2 rounded-md"
                  >
                    <Text className="text-white">Remove Day</Text>
                  </TouchableOpacity>
                </View>

                {values.schedule[selectedDay].periods.map((period, periodIndex) => (
                  <View 
                    key={`period-${selectedDay}-${periodIndex}`}
                    className="bg-gray-50 p-3 rounded-md mb-3"
                  >
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="font-medium">Period {periodIndex + 1}</Text>
                      <TouchableOpacity 
                        onPress={() => handleRemovePeriod(selectedDay, periodIndex)}
                        className="bg-red-500 py-1 px-2 rounded-md"
                      >
                        <Text className="text-white">Remove</Text>
                      </TouchableOpacity>
                    </View>

                    <InputField
                      name={`period-${selectedDay}-${periodIndex}-subjectId`}
                      value={period.subjectId}
                      onChangeText={handlePeriodChange(selectedDay, periodIndex, "subjectId")}
                      placeholder="Enter subject ID"
                      labelName="Subject ID"
                      error={
                        errors.schedule &&
                        errors.schedule[selectedDay] &&
                        errors.schedule[selectedDay].periods &&
                        errors.schedule[selectedDay].periods[periodIndex] &&
                        errors.schedule[selectedDay].periods[periodIndex].subjectId
                      }
                      style={{ color: "black" }}
                    />
                    <InputField
                      name={`period-${selectedDay}-${periodIndex}-teacherId`}
                      value={period.teacherId}
                      onChangeText={handlePeriodChange(selectedDay, periodIndex, "teacherId")}
                      placeholder="Enter teacher ID"
                      labelName="Teacher ID"
                      error={
                        errors.schedule &&
                        errors.schedule[selectedDay] &&
                        errors.schedule[selectedDay].periods &&
                        errors.schedule[selectedDay].periods[periodIndex] &&
                        errors.schedule[selectedDay].periods[periodIndex].teacherId
                      }
                      style={{ color: "black" }}
                    />
                    
                    <View className="flex-row">
                      <View className="flex-1 mr-2">
                        <InputField
                          name={`period-${selectedDay}-${periodIndex}-startTime`}
                          value={period.startTime}
                          onChangeText={handlePeriodChange(selectedDay, periodIndex, "startTime")}
                          placeholder="HH:MM"
                          labelName="Start Time"
                          error={
                            errors.schedule &&
                            errors.schedule[selectedDay] &&
                            errors.schedule[selectedDay].periods &&
                            errors.schedule[selectedDay].periods[periodIndex] &&
                            errors.schedule[selectedDay].periods[periodIndex].startTime
                          }
                          style={{ color: "black" }}
                        />
                      </View>
                      <View className="flex-1">
                        <InputField
                          name={`period-${selectedDay}-${periodIndex}-endTime`}
                          value={period.endTime}
                          onChangeText={handlePeriodChange(selectedDay, periodIndex, "endTime")}
                          placeholder="HH:MM"
                          labelName="End Time"
                          error={
                            errors.schedule &&
                            errors.schedule[selectedDay] &&
                            errors.schedule[selectedDay].periods &&
                            errors.schedule[selectedDay].periods[periodIndex] &&
                            errors.schedule[selectedDay].periods[periodIndex].endTime
                          }
                          style={{ color: "black" }}
                        />
                      </View>
                    </View>
                  </View>
                ))}

                <MyButton
                  title="Add Period"
                  onPress={() => handleAddPeriod(selectedDay)}
                  className="mt-2"
                />
              </View>
            )}
          </View>

          {/* Submit Button */}
          <View className="mt-6 mb-8">
            <MyButton title="Save Class Schedule" onPress={handleSubmit} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ClassScheduleForm;