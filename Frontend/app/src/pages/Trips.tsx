import { useState } from 'react';
import {
  Route,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Plus,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import UserAvatar from '@/components/UserAvatar';
import EmptyState from '@/components/EmptyState';
import type { Trip } from '@/types';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import CreateTripModal from '@/components/CreateTripModal';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="card-surface p-4 flex items-center gap-3">
      <div className={`p-2.5 rounded-xl ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-covoit-text-secondary">{label}</p>
      </div>
    </div>
  );
}

function TripRequestsPanel({ tripId }: { tripId: number }) {
  const { bookingRequests, confirmBooking, rejectBooking } = useApp();
  const [processingId, setProcessingId] = useState<number | null>(null);

  const requests = bookingRequests.filter(r => r.tripId === tripId);

  const handleConfirm = async (id: number) => {
    setProcessingId(id);
    await confirmBooking(id);
    setProcessingId(null);
  };

  const handleReject = async (id: number) => {
    setProcessingId(id);
    await rejectBooking(id);
    setProcessingId(null);
  };

  if (requests.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-covoit-text-muted">Aucune demande en attente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {requests.map(request => (
        <div
          key={request.id}
          className="flex flex-col sm:flex-row sm:items-center gap-3 bg-covoit-bg-tertiary rounded-xl p-4"
        >
          <div className="flex items-center gap-3 flex-1">
            <UserAvatar name={request.passenger.name} size={36} />
            <div>
              <p className="text-sm font-medium text-white">{request.passenger.name}</p>
              <p className="text-xs text-covoit-text-muted">
                {format(parseISO(request.createdAt), 'd MMM yyyy à HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleConfirm(request.id)}
              disabled={processingId === request.id}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-covoit-success/15 text-covoit-success text-sm font-medium hover:bg-covoit-success/25 transition-colors disabled:opacity-50"
            >
              <CheckCircle size={14} />
              Accepter
            </button>
            <button
              onClick={() => handleReject(request.id)}
              disabled={processingId === request.id}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-covoit-error/15 text-covoit-error text-sm font-medium hover:bg-covoit-error/25 transition-colors disabled:opacity-50"
            >
              <XCircle size={14} />
              Refuser
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DriverTripCard({ trip }: { trip: Trip }) {
  const [expanded, setExpanded] = useState(false);
  const availableSeats = trip.seats - trip.seatsBooked;
  const tripDate = parseISO(trip.date);
  const timeLabel = trip.time ?? format(tripDate, 'HH:mm');

  const statusColor =
    trip.status === 'active'
      ? 'bg-covoit-success/15 text-covoit-success'
      : trip.status === 'cancelled'
      ? 'bg-covoit-error/15 text-covoit-error'
      : 'bg-covoit-text-muted/15 text-covoit-text-muted';

  return (
    <div className="card-surface p-5">
      {/* Trip Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          {/* Route */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-white">{trip.departure}</span>
            <ArrowRight size={14} className="text-covoit-orange" />
            <span className="font-semibold text-white">{trip.destination}</span>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {trip.status === 'active' ? 'Actif' : trip.status === 'cancelled' ? 'Annulé' : 'Terminé'}
            </span>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-covoit-text-secondary">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-covoit-text-muted" />
              {format(tripDate, 'EEE d MMM yyyy', { locale: fr })} à {timeLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-covoit-text-muted" />
              {availableSeats} / {trip.seats} places
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={13} className="text-covoit-text-muted" />
              {trip.carModel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-lg font-bold text-covoit-orange">{trip.price} TND</p>
          {trip.status === 'active' && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-covoit-bg-tertiary text-covoit-text-secondary text-sm hover:text-white hover:bg-white/5 transition-all"
            >
              Voir demandes
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Requests */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ maxHeight: expanded ? 600 : 0 }}
      >
        {expanded && (
          <>
            <div className="h-px bg-white/[0.04] my-4" />
            <TripRequestsPanel tripId={trip.id} />
          </>
        )}
      </div>
    </div>
  );
}

export default function Trips() {
  const { driverTrips, createTrip } = useApp();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTrip = async (data: any) => {
    try {
      setIsCreating(true);
      await createTrip(data);
    } finally {
      setIsCreating(false);
    }
  };

  const stats = {
    total: driverTrips.length,
    active: driverTrips.filter(t => t.status === 'active').length,
    completed: driverTrips.filter(t => t.status === 'completed').length,
    cancelled: driverTrips.filter(t => t.status === 'cancelled').length,
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">Mes Trajets</h1>
          <p className="text-covoit-text-secondary">Gérez vos trajets et les demandes de réservation</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary flex items-center gap-2 py-3 px-5 self-start"
        >
          <Plus size={18} />
          Créer un trajet
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} icon={Route} color="bg-covoit-orange" />
        <StatCard label="Actifs" value={stats.active} icon={Calendar} color="bg-covoit-success" />
        <StatCard label="Terminés" value={stats.completed} icon={CheckCircle} color="bg-covoit-blue" />
        <StatCard label="Annulés" value={stats.cancelled} icon={XCircle} color="bg-covoit-error" />
      </div>

      {/* Trip List */}
      {driverTrips.length === 0 ? (
        <EmptyState
          icon={Route}
          title="Vous n'avez créé aucun trajet"
          description="Créez votre premier trajet pour commencer à recevoir des réservations"
          action={{ label: 'Créer un trajet', onClick: () => setIsCreateModalOpen(true) }}
        />
      ) : (
        <div className="space-y-4">
          {driverTrips.map(trip => (
            <DriverTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      <CreateTripModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreateTrip}
        isLoading={isCreating}
      />
    </div>
  );
}
