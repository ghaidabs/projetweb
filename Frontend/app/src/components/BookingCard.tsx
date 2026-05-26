import { MapPin, ArrowRight, Calendar, Clock } from 'lucide-react';
import type { Booking } from '@/types';
import StatusBadge from './StatusBadge';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: number) => void;
  isCancelling?: boolean;
}

export default function BookingCard({ booking, onCancel, isCancelling = false }: BookingCardProps) {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <div className="card-surface p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status Badge */}
        <div className="shrink-0">
          <StatusBadge status={booking.status} />
        </div>

        {/* Trip Info */}
        <div className="flex-1 min-w-0">
          {/* Route */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white">{booking.trip.departure}</span>
            <ArrowRight size={14} className="text-covoit-orange" />
            <span className="font-semibold text-white">{booking.trip.destination}</span>
          </div>

          {/* Date & Driver */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-covoit-text-secondary">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-covoit-text-muted" />
              {format(parseISO(booking.trip.date), 'EEE d MMM yyyy', { locale: fr })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} className="text-covoit-text-muted" />
              {booking.trip.time}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-covoit-text-muted" />
              {booking.trip.driver.name}
            </span>
          </div>

          {/* Cancel Reason */}
          {booking.cancelReason && (
            <p className="text-xs text-covoit-error mt-2">{booking.cancelReason}</p>
          )}
        </div>

        {/* Price & Actions */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <p className="text-lg font-bold text-covoit-orange">{booking.trip.price} TND</p>
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={isCancelling}
              className="btn-ghost text-xs py-2 px-4 disabled:opacity-50"
            >
              {isCancelling ? 'Annulation...' : 'Annuler'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
