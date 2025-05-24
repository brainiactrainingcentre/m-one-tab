import * as ImagePicker from "expo-image-picker";
import { Alert, Platform } from "react-native";

/**
 * Request permission and pick an image from the media library
 * @returns {Promise<Object|null>} The selected image object or null if canceled/error
 */
export const pickImage = async () => {
  // Ask for permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
  if (status !== "granted") {
    Alert.alert(
      "Permission Required", 
      "Please allow access to your photo library to update your profile picture."
    );
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      return result.assets[0];
    }
    return null;
  } catch (error) {
    console.error("Error picking image:", error);
    Alert.alert("Error", "Failed to select image. Please try again.");
    return null;
  }
};

 /**
 * Prepare image for upload by creating a FormData object
 * @param {string} uri - The URI of the image
 * @returns {FormData} FormData object with the image attached
 */
export const prepareImageUpload = (uri) => {
  const formData = new FormData();
  const uriParts = uri.split('.');
  const fileType = uriParts[uriParts.length - 1];

  // Handle URI format differences between iOS and Android
  const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
  
  const fileObj = {
    uri: fileUri,
    name: `profile-${Date.now()}.${fileType}`,
    type: `image/${fileType}`
  };

  formData.append('image', fileObj);
  return formData;
};