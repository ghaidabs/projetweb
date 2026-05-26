/**
 * Reviews API Service
 * Handles review creation, retrieval, and management
 */

import httpClient from '@/lib/http-client';
import { apiConfig } from '@/config/api';
import type { Review } from '@/types';

export interface CreateReviewRequest {
  tripId: number;
  rating: number;
  comment: string;
  tags: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
  tags?: string[];
}

export interface DriverStats {
  averageRating: number;
  totalReviews: number;
  totalTrips: number;
  badges: string[];
  distribution: Array<{
    stars: number;
    count: number;
  }>;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
  analytics: {
    lastTenAverage: number;
    positiveRate: number;
    trend: string;
    monthlyAverages: Array<{
      month: string;
      avg: number;
      count: number;
    }>;
  };
}

export const reviewsService = {
  /**
   * Submit a review for a trip
   */
  createReview: async (data: CreateReviewRequest): Promise<Review> => {
    const response = await httpClient.post(apiConfig.endpoints.reviews.create, data);
    return response.data;
  },

  /**
   * Get reviews for a specific driver
   */
  getDriverReviews: async (driverId: number): Promise<Review[]> => {
    const response = await httpClient.get(apiConfig.endpoints.reviews.getByDriver(driverId));
    return response.data;
  },

  /**
   * Get reviews for a specific trip
   */
  getTripReviews: async (tripId: number): Promise<Review[]> => {
    const response = await httpClient.get(apiConfig.endpoints.reviews.getByTrip(tripId));
    return response.data;
  },

  /**
   * Update a review
   */
  updateReview: async (reviewId: number, data: UpdateReviewRequest): Promise<Review> => {
    const response = await httpClient.patch(apiConfig.endpoints.reviews.update(reviewId), data);
    return response.data;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: number): Promise<void> => {
    await httpClient.delete(apiConfig.endpoints.reviews.delete(reviewId));
  },

  /**
   * Get comprehensive driver statistics
   */
  getDriverStats: async (driverId: number): Promise<DriverStats> => {
    const query = `
      query {
        driverStats(id: ${driverId}) {
          averageRating
          totalReviews
          totalTrips
          badges
          distribution {
            stars
            count
          }
          topTags {
            tag
            count
          }
          analytics {
            lastTenAverage
            positiveRate
            trend
            monthlyAverages {
              month
              avg
              count
            }
          }
        }
      }
    `;
    const response = await httpClient.post(apiConfig.endpoints.graphql, { query });
    return response.data.data.driverStats;
  },

  /**
   * Get reviews received by current driver
   */
  getMyReviews: async (): Promise<Review[]> => {
    const query = `
      query {
        myReviews {
          id
          rating
          comment
          tags
          createdAt
        }
      }
    `;
    const response = await httpClient.post(apiConfig.endpoints.graphql, { query });
    return response.data.data.myReviews;
  },

  /**
   * Get driver reviews (admin only)
   */
  getDriverReviewsAdmin: async (driverId: number): Promise<Review[]> => {
    const query = `
      query {
        driverReviewsAdmin(driverId: ${driverId}) {
          id
          rating
          comment
          tags
          createdAt
        }
      }
    `;
    const response = await httpClient.post(apiConfig.endpoints.graphql, { query });
    return response.data.data.driverReviewsAdmin;
  },

  /**
   * Recompute driver badges
   */
  recomputeBadges: async (driverId: number): Promise<void> => {
    await httpClient.post(`/driver/${driverId}/recompute-badges`);
  },
};
