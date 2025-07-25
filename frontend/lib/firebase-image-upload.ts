/**
 * Firebase Storage Image Upload Service for DoeAgora MVP
 * Handles image uploads to Firebase Storage (replaces IPFS/Pinata)
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export class FirebaseImageUploadService {
  
  /**
   * Upload image to Firebase Storage
   * @param file - Image file to upload
   * @param folder - Storage folder (profiles, campaigns, posts)
   * @param filename - Optional custom filename
   * @returns Promise<string> - Download URL
   */
  async uploadImage(
    file: File, 
    folder: 'profiles' | 'campaigns' | 'posts', 
    filename?: string
  ): Promise<string> {
    try {
      // Generate filename if not provided
      const finalFilename = filename || `${Date.now()}_${file.name}`;
      
      // Create storage reference
      const storageRef = ref(storage, `${folder}/${finalFilename}`);
      
      // Upload file
      console.log(`📤 Uploading image to Firebase Storage: ${folder}/${finalFilename}`);
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log(`✅ Image uploaded successfully: ${downloadURL}`);
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image to Firebase Storage:', error);
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  /**
   * Upload image from base64 string
   * @param base64Data - Base64 image data
   * @param folder - Storage folder
   * @param filename - Custom filename
   * @returns Promise<string> - Download URL
   */
  async uploadBase64Image(
    base64Data: string, 
    folder: 'profiles' | 'campaigns' | 'posts',
    filename: string
  ): Promise<string> {
    try {
      // Convert base64 to blob
      const response = await fetch(base64Data);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], filename, { type: blob.type });
      
      // Upload using regular upload method
      return await this.uploadImage(file, folder, filename);
    } catch (error) {
      console.error('❌ Error uploading base64 image:', error);
      throw new Error(`Failed to upload base64 image: ${error}`);
    }
  }

  /**
   * Delete image from Firebase Storage
   * @param imageUrl - Full Firebase Storage URL
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract path from URL
      const url = new URL(imageUrl);
      const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
      
      // Create reference and delete
      const imageRef = ref(storage, path);
      await deleteObject(imageRef);
      
      console.log(`🗑️ Image deleted successfully: ${path}`);
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      // Don't throw error for deletion failures
    }
  }

  /**
   * Upload profile avatar
   * @param file - Image file
   * @param organizationId - Organization ID for filename
   * @returns Promise<string> - Download URL
   */
  async uploadProfileAvatar(file: File, organizationId: string): Promise<string> {
    const filename = `avatar_${organizationId}_${Date.now()}.${file.name.split('.').pop()}`;
    return await this.uploadImage(file, 'profiles', filename);
  }

  /**
   * Upload campaign image
   * @param file - Image file
   * @param campaignId - Campaign ID for filename
   * @returns Promise<string> - Download URL
   */
  async uploadCampaignImage(file: File, campaignId: string): Promise<string> {
    const filename = `campaign_${campaignId}_${Date.now()}.${file.name.split('.').pop()}`;
    return await this.uploadImage(file, 'campaigns', filename);
  }

  /**
   * Upload post image
   * @param file - Image file
   * @param postId - Post ID for filename
   * @returns Promise<string> - Download URL
   */
  async uploadPostImage(file: File, postId: string): Promise<string> {
    const filename = `post_${postId}_${Date.now()}.${file.name.split('.').pop()}`;
    return await this.uploadImage(file, 'posts', filename);
  }

  /**
   * Check if URL is a Firebase Storage URL
   * @param url - URL to check
   * @returns boolean
   */
  isFirebaseStorageUrl(url: string): boolean {
    return url.includes('firebasestorage.googleapis.com') || url.includes('firebase');
  }

  /**
   * Get optimized image URL with size parameters
   * @param url - Original Firebase Storage URL
   * @param width - Desired width
   * @param height - Desired height
   * @returns string - Optimized URL
   */
  getOptimizedImageUrl(url: string, width?: number, height?: number): string {
    if (!this.isFirebaseStorageUrl(url)) {
      return url;
    }

    // Firebase doesn't have built-in image optimization like Cloudinary
    // For MVP, return original URL
    // In production, consider using Firebase Extensions or external service
    return url;
  }
}

// Export singleton instance
export const firebaseImageUpload = new FirebaseImageUploadService();
