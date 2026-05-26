# Backend-Frontend Integration - Quick Reference

## Installation & Setup

```bash
# 1. Go to app directory
cd app

# 2. Install dependencies
npm install

# 3. Create .env.local
echo "VITE_API_BASE_URL=http://localhost:3000" > .env.local

# 4. Start dev server
npm run dev
```

## File Structure Created

```
src/
├── config/api.ts                    # API endpoints config
├── lib/
│   ├── http-client.ts              # Axios with JWT & refresh flow
│   └── graphql-client.ts           # GraphQL query builder
├── services/                        # API services (no duplication)
│   ├── auth.ts
│   ├── trips.ts
│   ├── bookings.ts
│   ├── users.ts
│   ├── alerts.ts
│   ├── reviews.ts
│   └── index.ts
├── hooks/
│   ├── use-sse.ts                  # SSE real-time hooks
│   └── use-subscriptions.ts        # WebSocket subscription hooks
└── context/AppContext.tsx          # Global state with API integration
```

## Core Services Mapping

### REST Endpoints
- **Auth**: Register, Login, Logout, Token Refresh
- **Trips**: CRUD operations, Search, Stats
- **Bookings**: Create, Cancel, Confirm/Reject
- **Users**: Profile management
- **Alerts**: CRUD operations

### GraphQL Queries
- Users: `me`, `userProfile`, `updateProfile`
- Trips: `upcomingTrips`, `tripsByStatus`, `searchTrips`, `tripsStats`, `tripsNearDate`
- Bookings: `myBookings`, `booking`
- Reviews: `driverStats`, `myReviews`, `driverReviewsAdmin`

### Real-Time Features
- **SSE**: Driver ratings, Passenger notifications, Driver badges
- **WebSocket**: Trip creation, Booking confirmations, Trip cancellations

## Usage Examples

### Login/Logout
```typescript
import { useApp } from '@/context/AppContext';

function Auth() {
  const { login, logout, currentUser, isAuthenticated } = useApp();
  
  const handleLogin = async () => {
    await login('user@example.com', 'password');
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  return <div>{isAuthenticated && `Hi ${currentUser?.name}`}</div>;
}
```

### Search & Book Trips
```typescript
function SearchTrips() {
  const { searchTrips, createBooking, bookingsLoading } = useApp();
  
  const handleSearch = async () => {
    const trips = await searchTrips('Tunis', 'Sousse', '2026-06-01');
  };
  
  const handleBook = async (tripId) => {
    await createBooking(tripId);
  };
  
  return <button onClick={handleBook}>Book</button>;
}
```

### Create Trip (Driver)
```typescript
function CreateTrip() {
  const { createTrip } = useApp();
  
  const handleCreate = async () => {
    await createTrip({
      departure: 'Tunis',
      destination: 'Nabeul',
      date: '2026-06-01T08:00:00.000Z',
      seats: 3,
      price: 5,
      description: 'Comfortable trip',
      carModel: 'Renault Clio'
    });
  };
  
  return <button onClick={handleCreate}>Create</button>;
}
```

### Manage Bookings (Passenger)
```typescript
function MyBookings() {
  const { bookings, cancelBooking, bookingsLoading } = useApp();
  
  return bookings.map(booking => (
    <div key={booking.id}>
      {booking.trip.departure} → {booking.trip.destination}
      <button onClick={() => cancelBooking(booking.id)}>Cancel</button>
    </div>
  ));
}
```

### Confirm/Reject Requests (Driver)
```typescript
function BookingRequests() {
  const { bookingRequests, confirmBooking, rejectBooking } = useApp();
  
  return bookingRequests.map(req => (
    <div key={req.id}>
      <p>{req.passenger.name}</p>
      <button onClick={() => confirmBooking(req.id)}>Accept</button>
      <button onClick={() => rejectBooking(req.id)}>Reject</button>
    </div>
  ));
}
```

### Create/Delete Alerts
```typescript
function Alerts() {
  const { alerts, createAlert, deleteAlert } = useApp();
  
  const handleCreateAlert = async () => {
    await createAlert('Tunis', 'Nabeul', '2026-06-01');
  };
  
  const handleDeleteAlert = async (alertId) => {
    await deleteAlert(alertId);
  };
  
  return (
    <>
      <button onClick={handleCreateAlert}>Set Alert</button>
      {alerts.map(alert => (
        <div key={alert.id}>
          {alert.departure} → {alert.destination}
          <button onClick={() => handleDeleteAlert(alert.id)}>Delete</button>
        </div>
      ))}
    </>
  );
}
```

### Real-Time Updates
```typescript
function DriverStats({ driverId }) {
  const { isConnected, data } = useDriverLiveRating(driverId);
  
  return <div>Current Rating: {data?.rating}</div>;
}

function TripAlerts() {
  const { trips } = useTripCreatedSubscription('Tunis', 'Sousse');
  
  return <div>New trips: {trips.length}</div>;
}
```

### Profile Management
```typescript
function Profile() {
  const { currentUser, updateProfile, profileLoading } = useApp();
  
  const handleUpdate = async () => {
    await updateProfile({
      name: 'New Name',
      phone: '+21612345678',
      profileImage: 'https://...'
    });
  };
  
  return (
    <>
      <p>{currentUser?.name}</p>
      <button onClick={handleUpdate} disabled={profileLoading}>
        Update
      </button>
    </>
  );
}
```

## Key Features

✅ **JWT Token Management**
- Automatic token injection in requests
- Automatic token refresh on 401
- Request queuing during refresh
- Local storage persistence

✅ **Error Handling**
- Automatic error notifications
- User-friendly error messages
- Network error recovery
- Validation error display

✅ **Loading States**
- `authLoading`, `tripsLoading`, `bookingsLoading`, `alertsLoading`, `profileLoading`
- Easy to show spinners/disable buttons

✅ **Data Caching**
- Trips, bookings, alerts cached in AppContext
- Reduced API calls
- Better offline experience

✅ **Real-Time Features**
- SSE for one-way updates
- WebSocket for two-way subscriptions
- Auto-reconnect logic
- Typed data structures

✅ **Type Safety**
- Full TypeScript support
- Typed request/response objects
- Typed hooks and context

## No Duplications

- Each API endpoint implemented once in its service
- AppContext uses services, not duplicating logic
- Shared http-client for all requests
- Single source of truth for configuration

## Testing

### Test Authentication
```bash
# Register new user
POST http://localhost:3000/auth/register
Body: { "name": "Test", "email": "test@test.com", "password": "Pass@123", "phone": "+21612345678" }

# Login
POST http://localhost:3000/auth/login
Body: { "email": "test@test.com", "password": "Pass@123" }
```

### Test API Integration
1. Start frontend: `npm run dev`
2. Open browser DevTools > Network tab
3. Perform actions and verify API calls
4. Check request headers for `Authorization: Bearer <token>`
5. Check response data matches types

## Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Clear localStorage, re-login |
| Network Error | Check backend running on :3000 |
| CORS Error | Verify backend CORS config |
| GraphQL Error | Check query syntax in browser DevTools |
| SSE not working | Verify backend supports SSE on endpoint |
| Types missing | Run `npm install` and rebuild project |

## Environment Variables

```
# .env.local
VITE_API_BASE_URL=http://localhost:3000

# Production
VITE_API_BASE_URL=https://your-api-domain.com
```

## Dependencies

Added to `package.json`:
- **axios** ^1.7.0 - HTTP client

All other dependencies already present.

## API Documentation

Full documentation available in:
- `/INTEGRATION_GUIDE.md` - Detailed integration guide
- `src/services/*.ts` - Service function documentation
- `src/hooks/*.ts` - Hook documentation

## Support

For issues or questions:
1. Check `INTEGRATION_GUIDE.md`
2. Review service implementation in `src/services/`
3. Check backend API responses in browser DevTools
4. Verify `.env.local` configuration
