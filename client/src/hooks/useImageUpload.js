import { useState } from 'react';
import { Alert } from 'react-native';
import { pickImage, prepareImageUpload } from '../utils/imageUploadUtils';

/**
 * Custom hook for handling image uploads
 * @param {Function} uploadMutation - The RTK Query mutation hook for uploading
 * @param {Function} onSuccess - Callback function to execute on successful upload
 * @returns {Object} Image upload utilities and state
 */
export const useImageUpload = (uploadMutation, onSuccess) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  /**
   * Handle image selection from library
   */
  const handleSelectImage = async () => {
    const imageAsset = await pickImage();
    if (imageAsset) {
      setSelectedImage(imageAsset);
      return imageAsset;
    }
    return null;
  };

  /**
   * Upload image to server
   * @param {string} uri - Image URI to upload (optional, will use selectedImage if not provided)
   */
  const uploadImage = async (uri = null) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Use provided URI or get from selectedImage
      const imageUri = uri || selectedImage?.uri;
      
      if (!imageUri) {
        throw new Error('No image selected');
      }

      const formData = prepareImageUpload(imageUri);
      const response = await uploadMutation(formData).unwrap();
      
      if (response.status === 'success') {
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(response);
        }
        return response;
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error?.data?.message || error.message || 'Failed to upload image. Please try again.';
      setUploadError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Handle full image selection and upload process
   */
  const selectAndUploadImage = async () => {
    const selected = await handleSelectImage();
    if (selected) {
      return uploadImage(selected.uri);
    }
    return null;
  };

  return {
    isUploading,
    uploadError,
    selectedImage,
    handleSelectImage,
    uploadImage,
    selectAndUploadImage
  };
};