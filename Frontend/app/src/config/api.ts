/**
 * API Configuration
 * Centralized configuration for the backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_TIMEOUT = 30000; // 30 seconds

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  endpoints: {
    auth: {
      register: '/auth/register',
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    trips: {
      list: '/trips',
      create: '/trips',
      detail: (id: number) => `/trips/${id}`,
      myTrips: '/trips/mine',
      update: (id: number) => `/trips/${id}`,
      delete: (id: number) => `/trips/${id}`,
      search: '/trips/search',
    },
    bookings: {
      create: '/bookings',
      cancel: (id: number) => `/bookings/${id}`,
      confirm: (id: number) => `/bookings/${id}/confirm`,
      reject: (id: number) => `/bookings/${id}/reject`,
      pendingByTrip: (tripId: number) => `/bookings/trip/${tripId}/pending`,
    },
    users: {
      me: '/users/me',
      profile: (id: number) => `/users/${id}`,
      updateProfile: '/users/profile',
    },
    alerts: {
      list: '/alerts',
      create: '/alerts',
      delete: (id: number) => `/alerts/${id}`,
    },
    reviews: {
      create: '/reviews',
      getByDriver: (driverId: number) => `/reviews/driver/${driverId}`,
      getByTrip: (tripId: number) => `/trips/${tripId}/reviews`,
      update: (id: number) => `/reviews/${id}`,
      delete: (id: number) => `/reviews/${id}`,
    },
    graphql: '/graphql',
  },
};
