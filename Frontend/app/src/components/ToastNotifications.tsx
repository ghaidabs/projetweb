import { useEffect } from 'react';
import { CheckCircle, XCircle, Bell, X } from 'lucide-react';
import type { Notification } from '@/types';

interface ToastItemProps {
  notification: Notification;
  onDismiss: (id: number) => void;
}

const iconMap = {
  success: { Icon: CheckCircle, color: 'text-covoit-success', border: 'border-l-covoit-success' },
  error: { Icon: XCircle, color: 'text-covoit-error', border: 'border-l-covoit-error' },
  info: { Icon: Bell, color: 'text-covoit-blue', border: 'border-l-covoit-blue' },
};

function ToastItem({ notification, onDismiss }: ToastItemProps) {
  const { Icon, color, border } = iconMap[notification.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div
      className={`flex items-start gap-3 bg-covoit-bg-secondary border-l-4 ${border} rounded-xl p-4 shadow-card-hover animate-toast-in max-w-sm`}
    >
      <Icon size={20} className={`${color} mt-0.5 shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{notification.message}</p>
        {notification.details && (
          <p className="text-xs text-covoit-text-secondary mt-0.5">{notification.details}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(notification.id)}
        className="p-0.5 rounded hover:bg-white/10 transition-colors text-covoit-text-muted hover:text-white shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: number) => void;
}

export default function ToastNotifications({ notifications, onDismiss }: ToastNotificationsProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[90] flex flex-col gap-2 pointer-events-none">
      {notifications.slice(0, 4).map(notification => (
        <div key={notification.id} className="pointer-events-auto">
          <ToastItem notification={notification} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
