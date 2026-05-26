import { MapPin, Calendar, Users, ArrowRight, Car } from 'lucide-react';
import type { Trip } from '@/types';
import UserAvatar from './UserAvatar';
import StarRating from './StarRating';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TripCardProps {
  trip: Trip;
  onBook?: (tripId: number) => void;
  isBooking?: boolean;
}

export default function TripCard({ trip, onBook, isBooking = false }: TripCardProps) {
  const availableSeats = trip.seats - trip.seatsBooked;
  const tripDate = parseISO(trip.date);
  const timeLabel = trip.time ?? format(tripDate, 'HH:mm');
  const driverName = trip.driver?.name ?? 'Conducteur';
  const driverRating = trip.driver?.rating;

  return (
    <div className="card-surface card-hover p-5 flex flex-col gap-4">
      {/* Route */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-lg font-semibold text-white">{trip.departure}</p>
          <p className="text-xs text-covoit-text-muted flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> Départ
          </p>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-covoit-orange/10">
          <ArrowRight size={14} className="text-covoit-orange" />
        </div>
        <div className="flex-1 text-right">
          <p className="text-lg font-semibold text-white">{trip.destination}</p>
          <p className="text-xs text-covoit-text-muted flex items-center gap-1 mt-0.5 justify-end">
            <MapPin size={10} /> Arrivée
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/[0.04]" />

      {/* Date & Seats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-covoit-text-secondary">
          <Calendar size={14} className="text-covoit-text-muted" />
          <span>
            {format(tripDate, 'EEE d MMM yyyy', { locale: fr })} à {timeLabel}
          </span>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-covoit-orange/15 text-covoit-orange text-xs font-medium">
          <Users size={12} />
          {availableSeats} place{availableSeats > 1 ? 's' : ''}
        </span>
      </div>

      {/* Car Model */}
      <div className="flex items-center gap-2 text-sm text-covoit-text-secondary">
        <Car size={14} className="text-covoit-text-muted" />
        <span>{trip.carModel}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-covoit-text-secondary">{trip.description}</p>

      {/* Divider */}
      <div className="h-px bg-white/[0.04]" />

      {/* Driver & Price */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={driverName} size={36} />
          <div>
            <p className="text-sm font-medium text-white">{driverName}</p>
            {driverRating !== undefined && <StarRating rating={driverRating} size={12} />}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-covoit-orange">{trip.price} TND</p>
          <p className="text-xs text-covoit-text-muted">par place</p>
        </div>
      </div>

      {/* Book Button */}
      {onBook && (
        <button
          onClick={() => onBook(trip.id)}
          disabled={isBooking}
          className="w-full btn-primary py-3 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBooking ? 'Réservation en cours...' : 'Réserver'}
        </button>
      )}
    </div>
  );
}
