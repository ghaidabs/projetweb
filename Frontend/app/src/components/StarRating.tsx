import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number;
  showNumber?: boolean;
  size?: number;
}

export default function StarRating({ rating = 0, showNumber = false, size = 16 }: StarRatingProps) {
  const ratingValue = rating ?? 0;
  const fullStars = Math.floor(ratingValue);
  const hasHalf = ratingValue - fullStars >= 0.3;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-covoit-orange text-covoit-orange" />
        ))}
        {hasHalf && (
          <div className="relative" style={{ width: size, height: size }}>
            <Star size={size} className="absolute text-covoit-text-muted" />
            <div className="absolute overflow-hidden" style={{ width: size / 2 }}>
              <Star size={size} className="fill-covoit-orange text-covoit-orange" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-covoit-text-muted" />
        ))}
      </div>
      {showNumber && (
        <span className="text-sm text-covoit-text-secondary ml-1">{ratingValue.toFixed(1)}</span>
      )}
    </div>
  );
}
