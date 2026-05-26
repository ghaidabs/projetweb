/**
 * Services Index
 * Central export point for all API services
 */

export { authService } from './auth';
export type { RegisterRequest, LoginRequest, AuthResponse, RefreshTokenRequest } from './auth';

export { tripsService } from './trips';
export type { CreateTripRequest, UpdateTripRequest, TripFilters, SearchTripsResponse, TripStatsResponse } from './trips';

export { bookingsService } from './bookings';
export type { CreateBookingRequest, BookingResponse } from './bookings';

export { usersService } from './users';
export type { UpdateProfileRequest, UserProfile } from './users';

export { alertsService } from './alerts';
export type { CreateAlertRequest } from './alerts';

export { reviewsService } from './reviews';
export type { CreateReviewRequest, UpdateReviewRequest, DriverStats } from './reviews';
