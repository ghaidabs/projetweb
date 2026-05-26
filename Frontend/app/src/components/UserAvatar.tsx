interface UserAvatarProps {
  name: string;
  size?: number;
  showRing?: boolean;
  className?: string;
}

const colorMap: Record<string, string> = {
  A: 'bg-orange-600', B: 'bg-blue-600', C: 'bg-green-600', D: 'bg-purple-600',
  E: 'bg-pink-600', F: 'bg-yellow-600', G: 'bg-red-600', H: 'bg-indigo-600',
  I: 'bg-teal-600', J: 'bg-cyan-600', K: 'bg-lime-600', L: 'bg-amber-600',
  M: 'bg-emerald-600', N: 'bg-violet-600', O: 'bg-rose-600', P: 'bg-sky-600',
  Q: 'bg-fuchsia-600', R: 'bg-orange-500', S: 'bg-blue-500', T: 'bg-green-500',
  U: 'bg-purple-500', V: 'bg-pink-500', W: 'bg-red-500', X: 'bg-indigo-500',
  Y: 'bg-teal-500', Z: 'bg-yellow-500',
};

export default function UserAvatar({ name, size = 40, showRing = false, className = '' }: UserAvatarProps) {
  const initial = name.charAt(0).toUpperCase();
  const bgColor = colorMap[initial] || 'bg-covoit-orange';

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${bgColor} ${showRing ? 'ring-2 ring-covoit-orange ring-offset-2 ring-offset-covoit-bg' : ''} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initial}
    </div>
  );
}
