export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';
export type TripStatus = 'active' | 'cancelled' | 'completed';
export type NotificationType = 'success' | 'error' | 'info';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  rating: number;
  profileImage?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
}

export interface Trip {
  id: number;
  departure: string;
  destination: string;
  date: string;
  time?: string;
  seats: number;
  seatsBooked: number;
  price: number;
  status: TripStatus;
  description: string;
  carModel: string;
  driverId?: number;
  driver?: User;
  createdAt: string;
}

export interface Booking {
  id: number;
  passengerId: number;
  tripId: number;
  trip: Trip;
  status: BookingStatus;
  cancelReason?: string;
  createdAt: string;
}

export interface BookingRequest {
  id: number;
  passenger: User;
  tripId: number;
  status: BookingStatus;
  createdAt: string;
}

export interface Alert {
  id: number;
  departure: string;
  destination: string;
  date?: string;
  createdAt: string;
}

export interface Notification {
  id: number;
  type: NotificationType;
  message: string;
  details?: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: number;
  tripId: number;
  reviewerName: string;
  rating: number;
  comment: string;
  tags: string[];
  createdAt: string;
}
