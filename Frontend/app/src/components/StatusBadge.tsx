import type { BookingStatus } from '@/types';

interface StatusBadgeProps {
  status: BookingStatus;
}

const statusLabels: Record<BookingStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  rejected: 'Refusée',
  cancelled: 'Annulée',
};

const statusClasses: Record<BookingStatus, string> = {
  pending: 'status-pending',
  confirmed: 'status-confirmed',
  rejected: 'status-rejected',
  cancelled: 'status-cancelled',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
