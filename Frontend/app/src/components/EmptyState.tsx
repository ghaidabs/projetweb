import { type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-covoit-bg-tertiary mb-4">
        <Icon size={40} className="text-covoit-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-covoit-text-secondary max-w-xs mb-4">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm py-2.5 px-6 gradient-orange">
          {action.label}
        </button>
      )}
    </div>
  );
}
