import { useState } from 'react';
import { Bell, MapPin, Calendar, Trash2, AlertTriangle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Alertes() {
  const { alerts, createAlert, deleteAlert } = useApp();
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departure || !destination) return;
    createAlert(departure, destination, date || undefined);
    setDeparture('');
    setDestination('');
    setDate('');
  };

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-white mb-2">Mes Alertes</h1>
        <p className="text-covoit-text-secondary">
          Créez des alertes pour être notifié des nouveaux trajets sur vos routes préférées
        </p>
      </div>

      {/* Create Alert Form */}
      <div className="glass-panel rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Nouvelle alerte</h2>
        <form onSubmit={handleCreateAlert} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-covoit-text-muted" />
              <input
                type="text"
                value={departure}
                onChange={e => setDeparture(e.target.value)}
                placeholder="Départ *"
                className="input-field pl-9"
                required
              />
            </div>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-covoit-text-muted" />
              <input
                type="text"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Destination *"
                className="input-field pl-9"
                required
              />
            </div>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-covoit-text-muted" />
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="Date (optionnel)"
                className="input-field pl-9 text-covoit-text-secondary"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-covoit-text-muted">
            <AlertTriangle size={12} />
            <span>La date est optionnelle — laissez vide pour recevoir des alertes pour toutes les dates</span>
          </div>
          <button type="submit" className="btn-primary py-3 px-6">
            Créer une alerte
          </button>
        </form>
      </div>

      {/* Alert List */}
      <h2 className="text-lg font-semibold text-white mb-4">
        Alertes sauvegardées {alerts.length > 0 && `(${alerts.length})`}
      </h2>

      {alerts.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune alerte"
          description="Créez une alerte pour être notifié des nouveaux trajets"
        />
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className="card-surface p-4 flex items-center gap-4 card-hover"
            >
              <div className="p-2.5 rounded-xl bg-covoit-orange/10 shrink-0">
                <Bell size={18} className="text-covoit-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{alert.departure}</span>
                  <span className="text-covoit-text-muted">→</span>
                  <span className="font-semibold text-white">{alert.destination}</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-covoit-text-secondary">
                  <span>
                    {alert.date
                      ? format(parseISO(alert.date), 'EEE d MMM yyyy', { locale: fr })
                      : 'Toute date'}
                  </span>
                  <span className="text-covoit-text-muted">
                    Créée le {format(parseISO(alert.createdAt), 'd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setDeleteConfirm(alert.id)}
                className="p-2 rounded-lg hover:bg-covoit-error/10 transition-colors text-covoit-text-muted hover:text-covoit-error shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Supprimer l'alerte"
      >
        <p className="text-covoit-text-secondary mb-6">
          Êtes-vous sûr de vouloir supprimer cette alerte ? Vous ne recevrez plus de notifications pour cette route.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="btn-ghost flex-1 py-3">
            Annuler
          </button>
          <button
            onClick={() => {
              if (deleteConfirm) deleteAlert(deleteConfirm);
              setDeleteConfirm(null);
            }}
            className="flex-1 py-3 rounded-xl bg-covoit-error text-white font-medium hover:brightness-110 transition-all"
          >
            Supprimer
          </button>
        </div>
      </Modal>
    </div>
  );
}
