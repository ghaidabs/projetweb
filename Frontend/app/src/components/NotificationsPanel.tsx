import { useEffect, useRef } from 'react';
import { X, CheckCircle, XCircle, Bell, Trash2, CheckCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const iconMap = {
  success: { Icon: CheckCircle, color: 'text-covoit-success', bg: 'bg-covoit-success/15' },
  error: { Icon: XCircle, color: 'text-covoit-error', bg: 'bg-covoit-error/15' },
  info: { Icon: Bell, color: 'text-covoit-blue', bg: 'bg-covoit-blue/15' },
};

export default function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    panelOpen,
    setPanelOpen,
    markAsRead,
    markAllAsRead,
    dismissNotification,
  } = useApp();

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false);
    };
    if (panelOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [panelOpen, setPanelOpen]);

  return (
    <>
      {/* Overlay backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] animate-fade-in"
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[380px] glass-panel z-[80] flex flex-col transition-transform duration-300 ease-out ${
          panelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <p className="text-xs text-covoit-text-muted mt-0.5">
              {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-covoit-text-secondary hover:text-white"
                title="Tout marquer comme lu"
              >
                <CheckCheck size={18} />
              </button>
            )}
            <button
              onClick={() => setPanelOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-covoit-text-secondary hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell size={40} className="text-covoit-text-muted mb-3" />
              <p className="text-covoit-text-secondary text-sm">Aucune notification</p>
            </div>
          ) : (
            notifications.map(notification => {
              const { Icon, color, bg } = iconMap[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                    notification.read ? 'bg-covoit-bg-secondary/50' : 'bg-covoit-bg-secondary'
                  } hover:bg-covoit-bg-tertiary cursor-pointer group`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={`p-2 rounded-lg ${bg} shrink-0`}>
                    <Icon size={16} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? 'text-covoit-text-secondary' : 'text-white font-medium'}`}>
                      {notification.message}
                    </p>
                    {notification.details && (
                      <p className="text-xs text-covoit-text-muted mt-0.5">{notification.details}</p>
                    )}
                    <p className="text-xs text-covoit-text-muted mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all text-covoit-text-muted hover:text-covoit-error shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
