/**
 * Trips API Service
 * Handles trip creation, retrieval, updates, and search
 */

import httpClient from '@/lib/http-client';
import { apiConfig } from '@/config/api';
import { executeGraphQL } from '@/lib/graphql-client';
import type { Trip } from '@/types';

export interface CreateTripRequest {
  departure: string;
  destination: string;
  date: string;
  seats: number;
  price: number;
  description: string;
  carModel: string;
}

export interface UpdateTripRequest {
  price?: number;
  seats?: number;
  description?: string;
}

export interface TripFilters {
  departure?: string;
  destination?: string;
  date?: string;
  minSeats?: number;
  maxPrice?: number;
  sortBy?: 'date' | 'price' | 'driverRating';
  sortOrder?: 'ASC' | 'DESC';
  first?: number;
  after?: string;
}

export interface SearchTripsResponse {
  edges: Array<{
    node: Trip;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
  totalCount: number;
}

export interface TripStatsResponse {
  totalTrips: number;
  activeTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalSeats: number;
}

export const tripsService = {
  /**
   * Create a new trip
   */
  createTrip: async (data: CreateTripRequest): Promise<Trip> => {
    const response = await httpClient.post(apiConfig.endpoints.trips.create, data);
    return response.data;
  },

  /**
   * Get all available trips (paginated)
   */
  getTrips: async (page: number = 1, limit: number = 10): Promise<{ trips: Trip[]; total: number }> => {
    const query = `
      query UpcomingTrips($page: Int!, $limit: Int!) {
        upcomingTrips(page: $page, limit: $limit) {
          id
          departure
          destination
          date
          seats
          seatsBooked
          price
          status
          description
          carModel
          driverId
          driver {
            name
            rating
          }
          createdAt
        }
      }
    `;

    const response = await httpClient.post(apiConfig.endpoints.graphql, {
      query,
      variables: { page, limit },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    const trips = response.data.data.upcomingTrips;
    return { trips, total: trips.length };
  },

  /**
   * Get user's own trips
   */
  getMyTrips: async (): Promise<Trip[]> => {
    const response = await httpClient.get(apiConfig.endpoints.trips.myTrips);
    return response.data;
  },

  /**
   * Get trip by ID
   */
  getTripById: async (id: number): Promise<Trip> => {
    const response = await httpClient.get(apiConfig.endpoints.trips.detail(id));
    return response.data;
  },

  /**
   * Update a trip
   */
  updateTrip: async (id: number, data: UpdateTripRequest): Promise<Trip> => {
    const response = await httpClient.put(apiConfig.endpoints.trips.update(id), data);
    return response.data;
  },

  /**
   * Cancel a trip
   */
  cancelTrip: async (id: number): Promise<Trip> => {
    const response = await httpClient.delete(apiConfig.endpoints.trips.delete(id));
    return response.data;
  },

  /**
   * Search trips with filters
   */
  searchTrips: async (filters: TripFilters): Promise<SearchTripsResponse> => {
    const query = `
      query SearchTrips($filters: SearchTripsInput) {
        searchTrips(filters: $filters) {
          edges {
            cursor
            node {
              id
              departure
              destination
              date
              seats
              seatsBooked
              price
              status
              description
              carModel
              driverId
              driver {
                name
                rating
              }
              createdAt
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `;

    const normalizeDateFilter = (value?: string) => {
      if (!value) return undefined;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return `${value}T00:00:00`;
      }
      return value;
    };

    const graphqlFilters = {
      departure: filters.departure || undefined,
      destination: filters.destination || undefined,
      date: normalizeDateFilter(filters.date),
      minSeats: filters.minSeats || undefined,
      maxPrice: filters.maxPrice || undefined,
      sortBy: filters.sortBy || undefined,
      sortOrder: filters.sortOrder || undefined,
      first: filters.first || undefined,
      after: filters.after || undefined,
    };

    const response = await httpClient.post(apiConfig.endpoints.graphql, {
      query,
      variables: { filters: graphqlFilters },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.searchTrips;
  },

  /**
   * Search trips near a specific date (GraphQL)
   */
  searchTripsNearDate: async (date: string, rangeDays: number): Promise<Trip[]> => {
    const query = `
      query TripsNearDate($date: String!, $rangeDays: Int!) {
        tripsNearDate(date: $date, rangeDays: $rangeDays) {
          id
          departure
          destination
          date
          seats
          seatsBooked
          price
          status
          description
          carModel
          driverId
          driver {
            name
            rating
          }
          createdAt
        }
      }
    `;

    const response = await httpClient.post(apiConfig.endpoints.graphql, {
      query,
      variables: { date, rangeDays },
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.tripsNearDate;
  },

  /**
   * Get upcoming trips (paginated)
   */
  getUpcomingTrips: async (page: number = 1, limit: number = 10): Promise<{ trips: Trip[]; total: number }> => {
    const response = await httpClient.get(apiConfig.endpoints.trips.list, {
      params: { page, limit, status: 'active' },
    });
    return response.data;
  },

  /**
   * Get trips by status (active, cancelled, completed)
   */
  getTripsByStatus: async (status: 'active' | 'cancelled' | 'completed'): Promise<Trip[]> => {
    const response = await httpClient.get(apiConfig.endpoints.trips.list, {
      params: { status },
    });
    return response.data;
  },

  /**
   * Get trips near a specific date
   */
  getTripsNearDate: async (date: string, rangeDays: number = 3): Promise<Trip[]> => {
    const response = await httpClient.get(apiConfig.endpoints.trips.list, {
      params: { date, rangeDays },
    });
    return response.data;
  },

  /**
   * Get driver trip statistics
   */
  getTripStats: async (): Promise<TripStatsResponse> => {
    const response = await httpClient.get(apiConfig.endpoints.trips.list, {
      params: { stats: true },
    });
    return response.data;
  },

  /**
   * Get upcoming trips using GraphQL (pagination support)
   */
  getUpcomingTripsGraphQL: async (page: number = 1, limit: number = 10): Promise<Trip[]> => {
    const query = `
      query GetUpcomingTrips($page: Int!, $limit: Int!) {
        upcomingTrips(page: $page, limit: $limit) {
          id
          departure
          destination
          date
          price
          seats
          seatsBooked
          status
          description
          carModel
          createdAt
          driver {
            id
            name
            rating
          }
        }
      }
    `;
    const result = await executeGraphQL<{ upcomingTrips: Trip[] }>({
      query,
      variables: { page, limit },
    });
    return result.upcomingTrips || [];
  },

  /**
   * Search trips using GraphQL with advanced filters
   */
  searchTripsGraphQL: async (filters: {
    departure?: string;
    destination?: string;
    minSeats?: number;
    maxPrice?: number;
  } = {}): Promise<SearchTripsResponse> => {
    const query = `
      query SearchTrips($filters: SearchTripsFilter!) {
        searchTrips(filters: $filters) {
          edges {
            node {
              id
              departure
              destination
              price
              seats
              seatsBooked
              date
              status
              description
              carModel
              driver {
                id
                name
                rating
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `;
    const result = await executeGraphQL<{ searchTrips: SearchTripsResponse }>({
      query,
      variables: { filters },
    });
    return result.searchTrips;
  },
};
