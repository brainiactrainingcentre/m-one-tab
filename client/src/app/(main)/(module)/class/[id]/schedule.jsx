// app/classes/[id]/schedule.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetClassByIdQuery,
  useUpdateClassScheduleMutation,
  useGetSubjectsQuery,
  useGetAllTeachersQuery
} from "@/src/redux/services/auth";
import { Picker } from "@react-native-picker/picker";
import { Button, Card, TextInput } from "react-native-paper";

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const defaultPeriod = {
  subjectId: null,
  teacherId: null,
  startTime: "09:00",
  endTime: "10:00",
};

const ClassScheduleScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [schedule, setSchedule] = useState([]);
  const [currentDay, setCurrentDay] = useState("Monday");

  // API queries
  const { 
    data: classData, 
    isLoading, 
    isError,
    error
  } = useGetClassByIdQuery(id);
  
  const { 
    data: subjects, 
    isLoading: isLoadingSubjects 
  } = useGetSubjectsQuery();
  
  const { 
    data: teachers, 
    isLoading: isLoadingTeachers 
  } = useGetAllTeachersQuery();
  
  const [updateClassSchedule, { isLoading: isUpdating }] =
    useUpdateClassScheduleMutation();

  // Initialize schedule when data is loaded
  useEffect(() => {
    if (classData?.data?.schedule && classData.data.schedule.length > 0) {
      // Create a deep copy to avoid modifying original objects
      const scheduleData = JSON.parse(JSON.stringify(classData.data.schedule));
      
      // Transform the data to match our format
      const transformedSchedule = scheduleData.map(day => ({
        day: day.day,
        periods: day.periods.map(period => ({
          // Convert object IDs to simple IDs for the form
          subjectId: period.subject?._id || period.subject,
          teacherId: period.teacher?._id || period.teacher,
          startTime: period.startTime,
          endTime: period.endTime
        }))
      }));
      
      setSchedule(transformedSchedule);
    } else {
      // Initialize empty schedule for each day
      const emptySchedule = weekdays.map((day) => ({
        day,
        periods: [],
      }));
      setSchedule(emptySchedule);
    }
  }, [classData]);

  const getCurrentDaySchedule = () => {
    const daySchedule = schedule.find((item) => item.day === currentDay);
    return daySchedule ? [...daySchedule.periods] : [];
  };

  const handleAddPeriod = () => {
    // Create completely new objects and arrays to avoid mutation
    const newPeriod = { ...defaultPeriod };
    
    setSchedule(currentSchedule => {
      // Make a deep copy of the current schedule
      const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
      
      const dayIndex = newSchedule.findIndex(
        (item) => item.day === currentDay
      );

      if (dayIndex !== -1) {
        // Create a new periods array with the new period
        newSchedule[dayIndex] = {
          ...newSchedule[dayIndex],
          periods: [...newSchedule[dayIndex].periods, newPeriod]
        };
      } else {
        // Add a new day object
        newSchedule.push({
          day: currentDay,
          periods: [newPeriod]
        });
      }
      
      return newSchedule;
    });
  };

  const handleRemovePeriod = (periodIndex) => {
    setSchedule(currentSchedule => {
      // Make a deep copy of the current schedule
      const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
      
      const dayIndex = newSchedule.findIndex(
        (item) => item.day === currentDay
      );

      if (dayIndex !== -1) {
        // Filter out the period to remove
        newSchedule[dayIndex] = {
          ...newSchedule[dayIndex],
          periods: newSchedule[dayIndex].periods.filter((_, idx) => idx !== periodIndex)
        };
      }
      
      return newSchedule;
    });
  };

  const updatePeriodValue = (periodIndex, field, value) => {
    setSchedule(currentSchedule => {
      // Make a deep copy of the current schedule
      const newSchedule = JSON.parse(JSON.stringify(currentSchedule));
      
      const dayIndex = newSchedule.findIndex(
        (item) => item.day === currentDay
      );

      if (dayIndex !== -1 && 
          newSchedule[dayIndex].periods && 
          newSchedule[dayIndex].periods[periodIndex]) {
        // Create a new period object with the updated field
        const updatedPeriod = {
          ...newSchedule[dayIndex].periods[periodIndex],
          [field]: value
        };
        
        // Create a new periods array with the updated period
        const newPeriods = [...newSchedule[dayIndex].periods];
        newPeriods[periodIndex] = updatedPeriod;
        
        // Update the day with the new periods array
        newSchedule[dayIndex] = {
          ...newSchedule[dayIndex],
          periods: newPeriods
        };
      }
      
      return newSchedule;
    });
  };

  const handleSaveSchedule = async () => {
    try {
      // Filter days with periods and create a new object for the API
      const scheduleCopy = JSON.parse(JSON.stringify(schedule))
        .filter(day => day.periods && day.periods.length > 0);
      
      await updateClassSchedule({ 
        id, 
        schedule: scheduleCopy
      }).unwrap();
      
      Alert.alert(
        "Schedule Updated",
        "Class schedule has been updated successfully."
      );
    } catch (err) {
      console.error("Schedule update error:", err);
      Alert.alert(
        "Update Failed",
        err.data?.message || err.message || "Failed to update schedule."
      );
    }
  };

  // Time input validation
  const validateTimeFormat = (time) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(time);
  };

  const handleTimeChange = (periodIndex, field, value) => {
    // Allow typing
    updatePeriodValue(periodIndex, field, value);
    
    // Optional validation feedback
    if (value.length === 5 && !validateTimeFormat(value)) {
      Alert.alert(
        "Invalid Time Format",
        "Please use HH:MM format (e.g., 09:30)"
      );
    }
  };

  const navigateBack = () => {
    try {
      router.back();
    } catch (e) {
      console.error("Navigation error:", e);
      // Fallback navigation
      router.push(`/classes/${id}`);
    }
  };

  // Loading states
  if (isLoading || isLoadingSubjects || isLoadingTeachers) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading schedule data...</Text>
      </View>
    );
  }

  // Error state
  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error loading class data: {error?.data?.message || "Please try again."}
          </Text>
          <Button 
            mode="contained" 
            onPress={navigateBack} 
            style={styles.errorButton}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {classData?.data?.name || "Class"} Schedule
        </Text>
      </View>

      <View style={styles.daySelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekdays.map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                currentDay === day && styles.activeDayButton,
              ]}
              onPress={() => setCurrentDay(day)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  currentDay === day && styles.activeDayButtonText,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.dayTitle}>{currentDay}'s Schedule</Text>

            {getCurrentDaySchedule().length === 0 ? (
              <Text style={styles.emptyText}>
                No periods scheduled for this day.
              </Text>
            ) : (
              getCurrentDaySchedule().map((period, index) => (
                <View key={`period-${index}`} style={styles.periodItem}>
                  <Text style={styles.periodTitle}>Period {index + 1}</Text>

                  <Text style={styles.inputLabel}>Subject</Text>
                  <Picker
                    selectedValue={period.subjectId}
                    onValueChange={(value) =>
                      updatePeriodValue(index, "subjectId", value)
                    }
                    style={styles.picker}
                  >
                    <Picker.Item label="Select Subject" value={null} />
                    {(subjects || []).map((subject) => (
                      <Picker.Item
                        key={subject._id}
                        label={`${subject.name} (${subject.code})`}
                        value={subject._id}
                      />
                    ))}
                  </Picker>

                  <Text style={styles.inputLabel}>Teacher</Text>
                  <Picker
                    selectedValue={period.teacherId}
                    style={styles.picker}
                    onValueChange={(value) =>
                      updatePeriodValue(index, "teacherId", value)
                    }
                  >
                    <Picker.Item label="Select Teacher" value={null} />
                    {(teachers?.data || []).map((teacher) => (
                      <Picker.Item
                        key={teacher._id}
                        label={`${teacher.userId?.name || 'Unnamed'} (${teacher.employeeId || 'No ID'})`}
                        value={teacher._id}
                      />
                    ))}
                  </Picker>

                  <View style={styles.timeContainer}>
                    <View style={styles.timeField}>
                      <Text style={styles.inputLabel}>Start Time</Text>
                      <TextInput
                        style={styles.input}
                        value={period.startTime}
                        onChangeText={(value) =>
                          handleTimeChange(index, "startTime", value)
                        }
                        placeholder="HH:MM"
                        maxLength={5}
                        keyboardType="default"
                      />
                    </View>

                    <View style={styles.timeField}>
                      <Text style={styles.inputLabel}>End Time</Text>
                      <TextInput
                        style={styles.input}
                        value={period.endTime}
                        onChangeText={(value) =>
                          handleTimeChange(index, "endTime", value)
                        }
                        placeholder="HH:MM"
                        maxLength={5}
                        keyboardType="default"
                      />
                    </View>
                  </View>

                  <Button
                    mode="contained"
                    onPress={() => handleRemovePeriod(index)}
                    style={styles.removeButton}
                    color="#ff6961"
                    icon="delete"
                  >
                    Remove Period
                  </Button>
                </View>
              ))
            )}

            <Button
              mode="outlined"
              onPress={handleAddPeriod}
              style={styles.addButton}
              icon="plus"
            >
              Add Period
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleSaveSchedule}
          style={styles.saveButton}
          loading={isUpdating}
          disabled={isUpdating}
          icon="content-save"
        >
          {isUpdating ? "Saving..." : "Save Schedule"}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    color: "#007bff",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 20,
  },
  errorButton: {
    width: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
  },
  backButton: {
    fontSize: 16,
    color: "#007bff",
    marginRight: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  daySelector: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 1,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeDayButton: {
    backgroundColor: "#007bff",
  },
  dayButtonText: {
    color: "#333",
  },
  activeDayButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: "#666",
    fontStyle: "italic",
  },
  periodItem: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  periodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007bff",
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: "#555",
    fontWeight: "500",
  },
  picker: {
    backgroundColor: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeField: {
    width: "48%",
  },
  input: {
    backgroundColor: "#fff",
    height: 40,
    marginBottom: 12,
    borderRadius: 4,
  },
  removeButton: {
    marginTop: 8,
    backgroundColor: "#ff6961",
  },
  addButton: {
    marginTop: 16,
    borderColor: "#007bff",
    borderWidth: 1,
  },
  footer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    elevation: 4,
  },
  saveButton: {
    paddingVertical: 8,
    backgroundColor: "#007bff",
  },
});

export default ClassScheduleScreen;