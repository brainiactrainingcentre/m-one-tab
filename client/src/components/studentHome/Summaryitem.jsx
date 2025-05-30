import React from "react";
import { View, Text, Image } from 'react-native';
const SummaryItem=({label, count,icon})=>{
    return(
        <View className="flex-row justify-between items-center w-[96%] border mx-auto p-4 rounded-lg shadow-sm">
            
            <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Image source={icon} className="h-12 w-12" />
                </View>
                <Text className="font-bold text-lg">{label}</Text>
            </View>

            <View className="w-16 h-16 bg-[#0D0169] rounded-full flex items-center justify-center">
                <Text className="text-xl text-white font-bold">{count}</Text>
            </View>
        </View>
    );
}
export default SummaryItem;