# Backend-Frontend API Integration Guide

## Overview
This document describes how the Covoiturage platform frontend is integrated with the backend API using Axios, GraphQL, and real-time technologies (WebSockets and SSE).

## Project Structure

```
src/
├── config/
│   └── api.ts                 # API configuration and endpoints
├── lib/
│   ├── http-client.ts         # Axios instance with interceptors
│   └── graphql-client.ts      # GraphQL query builder utility
├── services/
│   ├── auth.ts                # Authentication API
│   ├── trips.ts               # Trips API
│   ├── bookings.ts            # Bookings API
│   ├── users.ts               # Users/Profile API
│   ├── alerts.ts              # Alerts API
│   ├── reviews.ts             # Reviews API
│   └── index.ts               # Services export index
├── hooks/
│   ├── use-sse.ts             # Server-Sent Events hooks
│   └── use-subscriptions.ts   # WebSocket subscriptions hooks
├── context/
│   └── AppContext.tsx         # Global app state with API integration
└── types/
    └── index.ts               # TypeScript type definitions
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in the `app` directory:

```
VITE_API_BASE_URL=http://localhost:3000
```

For production:
```
VITE_API_BASE_URL=https://your-backend-url.com
```

### 2. HTTP Client Configuration

The `http-client.ts` provides:
- **Automatic JWT token injection**: Reads from `localStorage.accessToken`
- **Token refresh flow**: Automatically refreshes expired tokens using `refreshToken`
- **Error handling**: Converts API errors to user-friendly messages
- **Request queuing**: Queues requests during token refresh to prevent race conditions

### 3. API Services Structure

Each service (`auth.ts`, `trips.ts`, etc.) exports:
- API functions that match backend endpoints
- TypeScript interfaces for request/response types
- Centralized error handling

Example usage:

```typescript
import { authService } from '@/services/auth';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Token is automatically stored in localStorage
// Future requests automatically include the JWT header
```

### 4. Global State Management (AppContext)

The `AppContext` integrates all API services and provides:
- Loading states for each operation
- Error notifications (via toast)
- Automatic data refresh on login
- Cached data for better UX

Usage:

```typescript
import { useApp } from '@/context/AppContext';

function MyComponent() {
  const { 
    currentUser, 
    trips, 
    tripsLoading, 
    searchTrips, 
    createBooking 
  } = useApp();

  const handleSearch = async () => {
    const results = await searchTrips('Tunis', 'Sousse', '2026-06-01');
  };

  const handleBook = async (tripId) => {
    await createBooking(tripId);
  };

  return (
    <>
      {tripsLoading && <Spinner />}
      {/* UI here */}
    </>
  );
}
```

## API Integration Details

### Authentication Flow

```
1. Register/Login
   └─> authService.register() / authService.login()
       └─> Stores accessToken & refreshToken in localStorage
           └─> User profile stored in localStorage

2. Authenticated Requests
   └─> http-client interceptor adds: Authorization: Bearer <token>

3. Token Refresh
   └─> If 401 response received
       └─> authService.refreshToken() called automatically
           └─> New tokens stored
               └─> Original request retried

4. Logout
   └─> authService.logout()
       └─> Calls backend logout endpoint
           └─> Clears all local storage
```

### Services Overview

#### **Auth Service** (`services/auth.ts`)
```typescript
// Register
authService.register({ name, email, password, phone })

// Login
authService.login({ email, password })

// Logout
authService.logout()

// Refresh token
authService.refreshToken(refreshToken)

// Check authentication
authService.isAuthenticated()
```

#### **Trips Service** (`services/trips.ts`)
```typescript
// Create trip
tripsService.createTrip({ departure, destination, date, seats, price, ... })

// Get trips (paginated)
tripsService.getTrips(page, limit)

// Get user's own trips
tripsService.getMyTrips()

// Search trips
tripsService.searchTrips({ departure, destination, minSeats, maxPrice, ... })

// Get trip by ID
tripsService.getTripById(id)

// Update trip
tripsService.updateTrip(id, { price, seats, description })

// Cancel trip
tripsService.cancelTrip(id)

// Get trip statistics
tripsService.getTripStats()

// Get trips near date
tripsService.getTripsNearDate(date, rangeDays)
```

#### **Bookings Service** (`services/bookings.ts`)
```typescript
// Create booking
bookingsService.createBooking(tripId)

// Get my bookings
bookingsService.getMyBookings()

// Cancel booking
bookingsService.cancelBooking(bookingId)

// Confirm booking (driver)
bookingsService.confirmBooking(bookingId)

// Reject booking (driver)
bookingsService.rejectBooking(bookingId)

// Get pending bookings for trip
bookingsService.getPendingBookings(tripId)
```

#### **Users Service** (`services/users.ts`)
```typescript
// Get current user profile
usersService.getMe()

// Get public profile
usersService.getUserProfile(userId)

// Update profile
usersService.updateProfile({ name, phone, profileImage, ... })
```

#### **Alerts Service** (`services/alerts.ts`)
```typescript
// Get alerts
alertsService.getAlerts()

// Create alert
alertsService.createAlert({ departure, destination, date })

// Delete alert
alertsService.deleteAlert(alertId)
```

#### **Reviews Service** (`services/reviews.ts`)
```typescript
// Create review
reviewsService.createReview({ tripId, rating, comment, tags })

// Get driver reviews
reviewsService.getDriverReviews(driverId)

// Get trip reviews
reviewsService.getTripReviews(tripId)

// Update review
reviewsService.updateReview(id, { rating, comment, tags })

// Delete review
reviewsService.deleteReview(id)

// Get driver stats
reviewsService.getDriverStats(driverId)

// Get current driver's reviews
reviewsService.getMyReviews()
```

## Real-Time Features

### Server-Sent Events (SSE)

For one-way real-time updates from server:

```typescript
import { useDriverLiveRating } from '@/hooks/use-sse';

function DriverStats({ driverId }) {
  const { isConnected, data } = useDriverLiveRating(driverId, {
    onMessage: (rating) => console.log('New rating:', rating),
    onError: (err) => console.error('SSE Error:', err)
  });

  return <div>Rating: {data?.rating}</div>;
}
```

Available SSE hooks:
- `useDriverLiveRating(driverId)` - Live driver rating updates
- `usePassengerReviewNotifications(passengerId)` - Trip completion notifications
- `useDriverBadgesLive(driverId)` - Badge achievement notifications

### WebSocket Subscriptions

For bidirectional real-time communication:

```typescript
import { useTripCreatedSubscription } from '@/hooks/use-subscriptions';

function TripAlerts() {
  const { isConnected, trips } = useTripCreatedSubscription('Tunis', 'Sousse', {
    onData: (trip) => console.log('New trip:', trip),
  });

  return <div>New trips: {trips.length}</div>;
}
```

Available subscriptions:
- `useTripCreatedSubscription(from, to)` - New trips matching criteria
- `useBookingConfirmedSubscription(userId)` - Booking confirmations
- `useTripCancelledSubscription(userId)` - Trip cancellations

## Error Handling

All services have built-in error handling with notifications:

```typescript
try {
  await bookingsService.createBooking(tripId);
} catch (error) {
  // Error notification automatically shown via AppContext
  console.error('Booking failed:', error);
}
```

Error responses include:
- HTTP error codes and messages from backend
- Validation errors from form submission
- Network connectivity errors
- Token expiration/refresh failures

## GraphQL Integration

For GraphQL queries (used in some services):

```typescript
import { executeGraphQL } from '@/lib/graphql-client';

const data = await executeGraphQL({
  query: `
    query {
      driverStats(id: 1) {
        averageRating
        totalReviews
        badges
      }
    }
  `
});
```

## Performance Optimizations

1. **Request Caching**: Trips/bookings are cached in AppContext
2. **Token Refresh**: Automatic without user interaction
3. **Error Recovery**: Failed requests automatically retry token refresh
4. **Real-time Updates**: Minimal bandwidth with SSE/WebSocket
5. **Lazy Loading**: Data loaded on-demand, not on app start

## Troubleshooting

### "Unauthorized" errors
- Check if `accessToken` is in localStorage
- Verify token hasn't expired
- Clear localStorage and re-login

### Network errors
- Verify backend is running on `http://localhost:3000`
- Check `.env.local` for correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

### GraphQL errors
- Check query syntax against schema
- Verify required authentication headers
- Check request variables format

### SSE/WebSocket not connecting
- Verify backend supports SSE/WebSocket
- Check browser WebSocket support
- Verify tokens are valid before opening connections

## Development Notes

### Adding New API Endpoints

1. Add endpoint to `config/api.ts`
2. Create service file in `services/` with typed functions
3. Export from `services/index.ts`
4. Integrate into `AppContext.tsx` if needed
5. Use in components via `useApp()` hook

### Adding New Real-Time Subscriptions

1. Create hook in `hooks/use-subscriptions.ts` or `use-sse.ts`
2. Handle connection lifecycle (onopen, onmessage, onerror, onclose)
3. Auto-reconnect logic
4. Type the data structures

## CORS Configuration

Ensure backend has CORS enabled for frontend URL:

```
Frontend: http://localhost:5173
Backend: http://localhost:3000
```

Configure in backend (example):
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## Security Considerations

1. **Tokens**: Stored in localStorage (consider httpOnly cookies for production)
2. **Passwords**: Never sent in logs or localStorage
3. **HTTPS**: Use HTTPS in production
4. **CORS**: Only allow trusted domains
5. **Rate Limiting**: Implement on backend to prevent abuse

## Next Steps

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and configure
3. Start backend server on port 3000
4. Run frontend: `npm run dev`
5. Test login/registration flow
6. Monitor network requests in browser DevTools
