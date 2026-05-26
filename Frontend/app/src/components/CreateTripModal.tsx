import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import Modal from './Modal';
import type { CreateTripRequest } from '@/services/trips';

interface CreateTripModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTripRequest) => Promise<void>;
  isLoading?: boolean;
}

export default function CreateTripModal({ open, onClose, onSubmit, isLoading = false }: CreateTripModalProps) {
  const [formData, setFormData] = useState<CreateTripRequest>({
    departure: '',
    destination: '',
    date: '',
    seats: 4,
    price: 10,
    description: '',
    carModel: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.departure.trim()) {
      setError('Le point de départ est requis');
      return;
    }
    if (!formData.destination.trim()) {
      setError('La destination est requise');
      return;
    }
    if (!formData.date) {
      setError('La date est requise');
      return;
    }
    if (formData.seats < 1 || formData.seats > 8) {
      setError('Le nombre de places doit être entre 1 et 8');
      return;
    }
    if (formData.price < 0) {
      setError('Le prix ne peut pas être négatif');
      return;
    }
    if (!formData.carModel.trim()) {
      setError('Le modèle de voiture est requis');
      return;
    }

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        departure: '',
        destination: '',
        date: '',
        seats: 4,
        price: 10,
        description: '',
        carModel: '',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="500px">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Créer un trajet</h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={20} className="text-covoit-text-secondary" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Departure */}
        <div>
          <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
            Point de départ *
          </label>
          <input
            type="text"
            value={formData.departure}
            onChange={e => setFormData({ ...formData, departure: e.target.value })}
            placeholder="ex: Tunis"
            className="input-field"
            disabled={isLoading}
            required
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
            Destination *
          </label>
          <input
            type="text"
            value={formData.destination}
            onChange={e => setFormData({ ...formData, destination: e.target.value })}
            placeholder="ex: Nabeul"
            className="input-field"
            disabled={isLoading}
            required
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
            Date et heure *
          </label>
          <input
            type="datetime-local"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="input-field"
            disabled={isLoading}
            required
          />
        </div>

        {/* Car Model */}
        <div>
          <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
            Modèle de voiture *
          </label>
          <input
            type="text"
            value={formData.carModel}
            onChange={e => setFormData({ ...formData, carModel: e.target.value })}
            placeholder="ex: Renault Clio"
            className="input-field"
            disabled={isLoading}
            required
          />
        </div>

        {/* Seats */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
              Nombre de places *
            </label>
            <input
              type="number"
              min="1"
              max="8"
              value={formData.seats}
              onChange={e => setFormData({ ...formData, seats: parseInt(e.target.value) || 1 })}
              className="input-field"
              disabled={isLoading}
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
              Prix par personne (TND) *
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="input-field"
              disabled={isLoading}
              required
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-covoit-text-secondary mb-1.5">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Décrivez votre trajet (climatisation, radio, etc.)"
            className="input-field resize-none h-24"
            disabled={isLoading}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 text-covoit-text-secondary font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg gradient-orange text-white font-medium hover:shadow-lg hover:shadow-covoit-orange/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader size={16} className="animate-spin" />}
            {isLoading ? 'Création...' : 'Créer le trajet'}
          </button>
        </div>
      </form>
    </Modal>
  );
}