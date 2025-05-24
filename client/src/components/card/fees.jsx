import React from 'react';
import { View, Text } from 'react-native';
import MyButton from '../atoms/myButton';

const Fees = ({ num1, num2, num3 }) => {
    return (
        <View className="shadow-lg bg-[#0D0169] rounded-2xl p-8 w-[98%] items-center mb-2.5 mx-auto">
            <View className="flex-row justify-between items-center w-4/5 mb-2.5">
                <Text className="text-[#F7C948] text-xl font-bold">Pending Fees:</Text>
                <Text className="text-[#F7C948] text-xl font-bold">{num1}</Text>
            </View>

            <View className="border-b-2 border-dashed border-white w-4/5 my-2.5" />

            <View className="flex-row justify-between items-center w-4/5 mb-2.5">
                <Text className="text-[#F7C948] text-xl font-bold">Paid Fees:</Text>
                <Text className="text-[#F7C948] text-xl font-bold">{num2}</Text>
            </View>

            <View className="border-b-2 border-dashed border-white w-4/5 my-2.5" />

            <View className="flex-row justify-between items-center w-4/5 mb-2.5">
                <Text className="text-[#F7C948] text-xl font-bold">Total Fees:</Text>
                <Text className="text-[#F7C948] text-xl font-bold mb-2.5">{num3}</Text>
            </View>
            
            <MyButton label="Pay Now" backgroundColor="#2ECC71" /> 
        </View>
    );
};

export default Fees;
