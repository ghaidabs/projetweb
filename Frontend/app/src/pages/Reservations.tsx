import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Ticket } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BookingCard from '@/components/BookingCard';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';

export default function Reservations() {
  const { bookings, cancelBooking } = useApp();
  const navigate = useNavigate();
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<number | null>(null);

  const handleCancel = async (bookingId: number) => {
    setCancellingId(bookingId);
    await cancelBooking(bookingId);
    setCancellingId(null);
    setConfirmCancel(null);
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">Mes Réservations</h1>
        <p className="text-covoit-text-secondary">
          {bookings.length > 0
            ? `${bookings.length} réservation${bookings.length > 1 ? 's' : ''}`
            : 'Gérez vos réservations Wassalni'}
        </p>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Vous n'avez aucune réservation"
          description="Recherchez un trajet et réservez votre place dès maintenant"
          action={{
            label: 'Rechercher un trajet',
            onClick: () => navigate('/'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={(id) => setConfirmCancel(id)}
              isCancelling={cancellingId === booking.id}
            />
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        open={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        title="Annuler la réservation"
      >
        <p className="text-covoit-text-secondary mb-6">
          Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setConfirmCancel(null)} className="btn-ghost flex-1 py-3">
            Non, garder
          </button>
          <button
            onClick={() => confirmCancel && handleCancel(confirmCancel)}
            disabled={!!cancellingId}
            className="flex-1 py-3 rounded-xl bg-covoit-error text-white font-medium hover:brightness-110 transition-all disabled:opacity-50"
          >
            {cancellingId ? 'Annulation...' : 'Oui, annuler'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
