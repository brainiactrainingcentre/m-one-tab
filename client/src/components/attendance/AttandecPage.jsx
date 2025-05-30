import React from "react";
import { View, Text, ScrollView, Dimensions } from "react-native";
import SummaryCard from "../studentHome/SummaryCard";
import SummaryItem from "../studentHome/Summaryitem";
import imagePath from "@/src/utils/constants/imagePath";

const AttandecePage = () => {
    const today = new Date().getDate();
    const screenWidth = Dimensions.get('window').width;
    
    // Calculate day cell size based on screen width
    const dayCellSize = Math.max(30, (screenWidth - 40) / 7);

    return (
        <ScrollView>
            <View className="mt-4 pb-4">
                <Text className="text-xl font-bold mx-3">My Attendance</Text>

                <View className="bg-gray-100 p-2 rounded-lg mt-2 mx-3">
                    {/* Weekday headers */}
                    <View className="flex-row justify-between mb-2">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <Text key={day} className="font-bold text-gray-700 text-center" style={{ width: dayCellSize }}>
                                {day}
                            </Text>
                        ))}
                    </View>
                    
                    {/* Calendar grid - rendered in rows of 7 */}
                    <View>
                        {Array(Math.ceil(31/7)).fill().map((_, weekIndex) => (
                            <View key={`week-${weekIndex}`} className="flex-row justify-between mb-2">
                                {Array(7).fill().map((_, dayIndex) => {
                                    const day = weekIndex * 7 + dayIndex + 1;
                                    if (day > 31) return <View key={`empty-${dayIndex}`} style={{ width: dayCellSize }} />;
                                    
                                    const isPresent = [3, 11, 2, 8,9, today].includes(day);
                                    const isToday = day === today;

                                    return (
                                        <View
                                            key={`day-${day}`}
                                            className={`rounded-md flex items-center justify-center 
                                                ${isPresent ? "bg-[#AAC4AB]" : ""} 
                                                ${isToday ? "bg-gray-300" : ""}`}
                                            style={{ width: dayCellSize, height: dayCellSize }}
                                        >
                                            <Text className={`text-black font-bold ${isPresent ? "mb-4" : ""}`}>
                                                {day}
                                            </Text>
                                            {isPresent && (
                                                <View className="absolute bottom-1 w-4 h-4 bg-gray-300 flex items-center justify-center rounded-sm">
                                                    <Text className="text-xs font-bold text-black">p</Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>

                <Text className="mx-3 font-bold text-xl mt-5">Month Attendance Summary</Text>
                <View className="flex-col mt-2">
                    <View className="flex-row flex-wrap justify-evenly">
                        <SummaryCard label="Present" count={1} color="#AAC4AB" icon={imagePath.icon14} />
                        <SummaryCard label="Absent" count={0} color="#DFAAAA" icon={imagePath.icon16} />
                    </View>
                    <View className="flex-row flex-wrap justify-evenly mt-4">
                        <SummaryCard label="Leave" count={0} color="#FFDBB6" icon={imagePath.icon16} />
                        <SummaryCard label="Holiday" count={0} color="#CC9EDE" icon={imagePath.icon15} />
                    </View>
                </View>

                <View className="mt-4 space-y-2 mx-3">
                    <Text className="font-bold text-xl mt-3">Academic Attendance Summary</Text>
                    <SummaryItem icon={imagePath.icon15} label="Total Attendance Days" count={158} />
                    <SummaryItem icon={imagePath.icon14} label="Total No. of Present Days" count={124} />
                </View>
            </View>
        </ScrollView>
    );
};

export default AttandecePage;