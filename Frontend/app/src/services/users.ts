/**
 * Users API Service
 * Handles user profile retrieval and updates
 */

import httpClient from '@/lib/http-client';
import { apiConfig } from '@/config/api';
import type { User } from '@/types';

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  profileImage?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface UserProfile extends User {
  role?: string;
  isEmailVerified?: boolean;
  updatedAt?: string;
}

export const usersService = {
  /**
   * Get current authenticated user profile
   */
  getMe: async (): Promise<UserProfile> => {
    const query = `
      query {
        me {
          id
          name
          email
          role
          phone
          profileImage
          rating
          isEmailVerified
          emergencyContact
          emergencyPhone
          createdAt
          updatedAt
        }
      }
    `;
    const response = await httpClient.post(apiConfig.endpoints.graphql, { query });
    return response.data.data.me;
  },

  /**
   * Get public profile of a user
   */
  getUserProfile: async (userId: number): Promise<UserProfile> => {
    const query = `
      query {
        userProfile(id: ${userId}) {
          id
          name
          role
          phone
          profileImage
          rating
          isEmailVerified
          createdAt
        }
      }
    `;
    const response = await httpClient.post(apiConfig.endpoints.graphql, { query });
    return response.data.data.userProfile;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const query = `
      mutation {
        updateProfile(input: {
          name: ${data.name ? `"${data.name}"` : 'null'}
          phone: ${data.phone ? `"${data.phone}"` : 'null'}
          profileImage: ${data.profileImage ? `"${data.profileImage}"` : 'null'}
          emergencyContact: ${data.emergencyContact ? `"${data.emergencyContact}"` : 'null'}
          emergencyPhone: ${data.emergencyPhone ? `"${data.emergencyPhone}"` : 'null'}
        }) {
          id
          name
          email
          phone
          profileImage
          emergencyContact
          emergencyPhone
          updatedAt
        }
      }
    `;
    const response = await httpClient.post(apiConfig.endpoints.graphql, { query });
    return response.data.data.updateProfile;
  },
};
