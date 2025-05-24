import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import MyButton from "@/src/components/atoms/myButton";
import imagePath from "@/src/utils/constants/imagePath";

import { useDispatch, useSelector } from "react-redux";
import { useImageUpload } from "@/src/hooks/useImageUpload";
import { useUpdateProfileImageMutation } from "@/src/redux/services/auth";
import { updateUserProfile } from "@/src/redux/slices/authSlice";
import { Ionicons } from "@expo/vector-icons";

const UserNameCard = ({ name, num }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const profileImage = user?.avatar; // avatar URL from backend

  const [updateProfileImage] = useUpdateProfileImageMutation();

  const {
    isUploading,
    selectAndUploadImage,
  } = useImageUpload(updateProfileImage, (res) => {
    dispatch(updateUserProfile(res.user)); // update avatar in Redux
  });

  return (
    <View className="m-1.5 bg-[#4328D2] rounded-xl pt-5 pb-5 pl-1.5 w-auto">
      <View className="flex-row">
        {/* Profile Image Upload Section */}
        <TouchableOpacity
          onPress={selectAndUploadImage}
          disabled={isUploading}
          className="w-[132px] h-[128px] rounded-full bg-white shadow-md justify-center items-center overflow-hidden p-1.5 mt-5"
        >
          {profileImage ? (
            <Image
              className="w-full h-full"
              resizeMode="cover"
              source={{ uri: profileImage }}
            />
          ) : (
            <Image
              className="w-full h-full"
              resizeMode="contain"
              source={imagePath.icon10}
            />
          )}
          {isUploading && (
            <View className="absolute inset-0 bg-black bg-opacity-50 items-center justify-center">
              <Text className="text-white text-xs">Uploading...</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Name + Number + Button */}
        <View className="flex-col ml-2.5 mt-5">
          <Text className="font-bold text-2xl text-white text-center">
            {name}
          </Text>
          <Text className="font-medium text-xl text-white text-center my-0.5">
            {num}
          </Text>
          <MyButton
            title="2024-25"
            backgroundColor="#FFFFFF"
            textColor="black"
          />
        </View>
      </View>
    </View>
  );
};

export default UserNameCard;
