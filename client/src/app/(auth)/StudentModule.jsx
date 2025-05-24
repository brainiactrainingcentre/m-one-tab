import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Module from '@/src/components/studentHome/Module';
import imagePath from '@/src/utils/constants/imagePath';
const StudentModule =()=>{
    return(
<view>
    <text style={{ 
        display:'flex',
        textAlign: 'center',
        fontSize: 50,
        fontWeight: 'bold',
        justifyContent: 'center',
     }}>Student Moudle</text>
    <view style={{
        display:'flex',
        flexDirection:'row',
        flexFlow:'wrap',
        
        justifyContent: 'center',
    }}>
                <Module title="Admission" subtext="Lorem ipsum dolor sit amet consectetur." icon={imagePath.icon1}></Module>
                <Module title="Acadimic Plan" subtext="Lorem ipsum dolor sit amet consectetur." icon={imagePath.icon2}></Module>
                <Module title="Online Exam" subtext="Lorem ipsum dolor sit amet consectetur." icon={imagePath.icon3}></Module>
                <Module title="Assignment" subtext="Lorem ipsum dolor sit amet consectetur." icon={imagePath.icon4}></Module>
                <Module title="Result Analysis" subtext="Lorem ipsum dolor sit amet consectetur." icon={imagePath.icon5}></Module>
                <Module title="LMS" subtext="Lorem ipsum dolor sit amet consectetur." icon={imagePath.icon6}></Module>
                <Module title="Library" subtext="Lorem ipsum dolor sit amet consectetur." icon={imagePath.icon7}></Module>
                <Module title="Fess" subtext="Lorem ipsum dolor sit amet consectetur." icon={imagePath.icon8}></Module>
    </view>
</view>)
}
export default StudentModule;