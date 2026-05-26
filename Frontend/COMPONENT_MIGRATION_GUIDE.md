# Component Integration Examples

This file shows how to update existing components to use the new API integration.

## Example 1: Login Component

### Before (Mock Data)
```typescript
// components/AuthModal.tsx
const handleLogin = () => {
  setIsAuthenticated(true);
  setAuthModal(false);
};
```

### After (API Integration)
```typescript
import { useApp } from '@/context/AppContext';

export function AuthModal() {
  const { login, authLoading, addNotification } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      // AppContext automatically:
      // - Stores tokens
      // - Loads user data
      // - Loads trips/bookings/alerts
      // - Shows success notification
    } catch (error) {
      // Error notification already shown
    }
  };

  return (
    <Button onClick={handleLogin} disabled={authLoading}>
      {authLoading ? 'Logging in...' : 'Login'}
    </Button>
  );
}
```

## Example 2: Trip Search Component

### Before (Mock Data)
```typescript
// pages/Home.tsx
const searchResults = searchTrips(departure, destination, date);
// Searches in static mockTrips array
```

### After (API Integration)
```typescript
import { useApp } from '@/context/AppContext';

export function Home() {
  const { searchTrips, tripsLoading, addNotification } = useApp();
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const trips = await searchTrips(departure, destination, date);
      setResults(trips);
      addNotification({
        type: 'success',
        message: `Found ${trips.length} trips`
      });
    } catch (error) {
      // Error notification auto-shown
    }
  };

  return (
    <>
      <button onClick={handleSearch} disabled={tripsLoading}>
        Search
      </button>
      {tripsLoading && <Spinner />}
      {results.map(trip => <TripCard trip={trip} />)}
    </>
  );
}
```

## Example 3: Booking Component

### Before (Mock Data)
```typescript
// components/TripCard.tsx
const handleBook = async (tripId) => {
  const newBooking: Booking = {
    id: Date.now(),
    passengerId: userState.id,
    tripId,
    trip: { ...trip },
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  setBookings(prev => [newBooking, ...prev]);
};
```

### After (API Integration)
```typescript
import { useApp } from '@/context/AppContext';

export function TripCard({ trip }) {
  const { createBooking, bookingsLoading } = useApp();

  const handleBook = async () => {
    try {
      await createBooking(trip.id);
      // AppContext:
      // - Makes API call
      // - Updates bookings state
      // - Shows success notification
    } catch (error) {
      // Error notification auto-shown
    }
  };

  return (
    <Card>
      <h3>{trip.departure} → {trip.destination}</h3>
      <p>${trip.price}</p>
      <Button onClick={handleBook} disabled={bookingsLoading}>
        {bookingsLoading ? 'Booking...' : 'Book'}
      </Button>
    </Card>
  );
}
```

## Example 4: Booking Management (Passenger)

### Before (Mock Data)
```typescript
// pages/Reservations.tsx
const bookings = bookings; // From context (mock data)

const handleCancel = async (bookingId) => {
  setBookings(prev =>
    prev.map(b =>
      b.id === bookingId
        ? { ...b, status: 'cancelled' }
        : b
    )
  );
};
```

### After (API Integration)
```typescript
import { useApp } from '@/context/AppContext';

export function Reservations() {
  const { bookings, cancelBooking, bookingsLoading } = useApp();

  const handleCancel = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      // AppContext:
      // - Makes API call
      // - Updates bookings state
      // - Shows notification
    } catch (error) {
      // Error already handled
    }
  };

  return (
    <div>
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={() => handleCancel(booking.id)}
          disabled={bookingsLoading}
        />
      ))}
    </div>
  );
}
```

## Example 5: Driver Booking Requests

### Before (Mock Data)
```typescript
// pages/Trips.tsx (driver view)
const pendingRequests = bookingRequests;

const handleConfirm = async (bookingId) => {
  setBookingRequests(prev => prev.filter(r => r.id !== bookingId));
};
```

### After (API Integration)
```typescript
import { useApp } from '@/context/AppContext';

export function TripRequests() {
  const { bookingRequests, confirmBooking, rejectBooking } = useApp();

  const handleConfirm = async (bookingId) => {
    try {
      await confirmBooking(bookingId);
      // AppContext updates bookingRequests state
    } catch (error) {
      // Error notification shown
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await rejectBooking(bookingId);
    } catch (error) {
      // Error notification shown
    }
  };

  return (
    <div>
      {bookingRequests.map(request => (
        <RequestCard
          key={request.id}
          request={request}
          onConfirm={() => handleConfirm(request.id)}
          onReject={() => handleReject(request.id)}
        />
      ))}
    </div>
  );
}
```

## Example 6: Alerts Management

### Before (Mock Data)
```typescript
// pages/Alertes.tsx
const handleCreate = (departure, destination, date) => {
  const newAlert: Alert = {
    id: Date.now(),
    departure,
    destination,
    date,
    createdAt: new Date().toISOString(),
  };
  setAlerts(prev => [newAlert, ...prev]);
};
```

### After (API Integration)
```typescript
import { useApp } from '@/context/AppContext';

export function Alertes() {
  const { alerts, createAlert, deleteAlert, alertsLoading } = useApp();

  const handleCreate = async (departure, destination, date) => {
    try {
      await createAlert(departure, destination, date);
      // AppContext:
      // - Makes API call
      // - Updates alerts state
      // - Shows notification
    } catch (error) {
      // Error notification shown
    }
  };

  const handleDelete = async (alertId) => {
    try {
      await deleteAlert(alertId);
    } catch (error) {
      // Error notification shown
    }
  };

  return (
    <div>
      <AlertForm onSubmit={handleCreate} disabled={alertsLoading} />
      {alerts.map(alert => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onDelete={() => handleDelete(alert.id)}
        />
      ))}
    </div>
  );
}
```

## Example 7: Profile Management

### Before (Mock Data)
```typescript
// pages/Profil.tsx
const handleUpdateProfile = (data) => {
  setUserState(prev => ({ ...prev, ...data }));
};
```

### After (API Integration)
```typescript
import { useApp } from '@/context/AppContext';

export function Profil() {
  const { currentUser, updateProfile, profileLoading } = useApp();

  const handleUpdateProfile = async (data) => {
    try {
      await updateProfile(data);
      // AppContext:
      // - Makes API call
      // - Updates currentUser
      // - Shows notification
    } catch (error) {
      // Error notification shown
    }
  };

  return (
    <Form
      initialValues={currentUser}
      onSubmit={handleUpdateProfile}
      disabled={profileLoading}
    >
      <input name="name" defaultValue={currentUser?.name} />
      <input name="phone" defaultValue={currentUser?.phone} />
      <Button type="submit" disabled={profileLoading}>
        {profileLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </Form>
  );
}
```

## Example 8: Trip Creation (Driver)

### Before (Mock Data)
```typescript
// components/CreateTripForm.tsx (hypothetical)
const handleCreateTrip = (formData) => {
  const newTrip = {
    id: Date.now(),
    ...formData,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  setTrips(prev => [newTrip, ...prev]);
};
```

### After (API Integration)
```typescript
import { useApp } from '@/context/AppContext';

export function CreateTripForm() {
  const { createTrip, tripsLoading } = useApp();

  const handleSubmit = async (formData) => {
    try {
      await createTrip({
        departure: formData.departure,
        destination: formData.destination,
        date: formData.date,
        seats: parseInt(formData.seats),
        price: parseFloat(formData.price),
        description: formData.description,
        carModel: formData.carModel,
      });
      // AppContext:
      // - Makes API call
      // - Updates driverTrips
      // - Shows success notification
    } catch (error) {
      // Error notification shown
    }
  };

  return (
    <Form onSubmit={handleSubmit} disabled={tripsLoading}>
      {/* Form fields */}
      <Button type="submit" disabled={tripsLoading}>
        {tripsLoading ? 'Creating...' : 'Create Trip'}
      </Button>
    </Form>
  );
}
```

## Example 9: Real-Time Driver Stats

### Before (Static Data)
```typescript
// components/DriverStats.tsx
const [stats] = useState(mockStats);
```

### After (Real-Time API)
```typescript
import { useApp } from '@/context/AppContext';
import { useDriverLiveRating } from '@/hooks/use-sse';

export function DriverStats({ driverId }) {
  const { isConnected, data: liveRating, error } = useDriverLiveRating(driverId, {
    onMessage: (rating) => console.log('Rating updated:', rating)
  });

  return (
    <div>
      <h3>Live Driver Rating</h3>
      {isConnected && <span className="online">●</span>}
      {liveRating && (
        <>
          <p>Current: {liveRating.rating}</p>
          <p>Count: {liveRating.count}</p>
        </>
      )}
      {error && <p className="error">Connection lost</p>}
    </div>
  );
}
```

## Example 10: Real-Time Trip Alerts

### Before (Polling)
```typescript
// useEffect that polls every 5 seconds
```

### After (WebSocket Subscriptions)
```typescript
import { useTripCreatedSubscription } from '@/hooks/use-subscriptions';

export function TripAlerts() {
  const { isConnected, trips } = useTripCreatedSubscription('Tunis', 'Sousse', {
    onData: (trip) => {
      // Show notification
      addNotification({
        type: 'success',
        message: 'New trip created!',
        details: `${trip.departure} → ${trip.destination}`
      });
    }
  });

  return (
    <div>
      <h3>Live Trips</h3>
      {isConnected ? <span>●</span> : <span>○</span>}
      <ul>
        {trips.map(trip => (
          <li key={trip.tripId}>{trip.departure} → {trip.destination}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Migration Checklist

- [ ] Replace all `mockTrips` usages with `searchTrips()`
- [ ] Replace all `mockBookings` with `getMyBookings()` or from context
- [ ] Replace all `mockAlerts` with `getAlerts()` or from context
- [ ] Replace direct state updates with API calls
- [ ] Add `loading` states to buttons/forms
- [ ] Add error handling to try/catch blocks
- [ ] Remove mock data initializations
- [ ] Test all flows with backend API
- [ ] Verify token refresh on 401 errors
- [ ] Test real-time features (SSE/WebSocket)
- [ ] Remove old context functions that duplicated logic

## Common Patterns

### Pattern 1: Async Action with Loading
```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  try {
    setLoading(true);
    await apiService.action();
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

Use AppContext loading states instead:
```typescript
const { actionLoading } = useApp();
const handleAction = async () => {
  await appAction(); // Loading handled by context
};
```

### Pattern 2: Data Fetching
```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      const data = await apiService.getData();
      setData(data);
    } catch (error) {
      // Handle error
    }
  };
  loadData();
}, []);
```

Use AppContext caching:
```typescript
const { data, dataLoading } = useApp();
// Data loaded on login, cached automatically
```

### Pattern 3: Form Submission
```typescript
const handleSubmit = async (formData) => {
  try {
    await apiService.create(formData);
    setSuccess(true);
  } catch (error) {
    setError(error.message);
  }
};
```

Use AppContext notifications:
```typescript
const handleSubmit = async (formData) => {
  try {
    await appCreate(formData);
    // Success notification auto-shown
  } catch (error) {
    // Error notification auto-shown
  }
};
```

