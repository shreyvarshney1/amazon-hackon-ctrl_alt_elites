"use client";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count?: string | number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  hoveredRating?: number;
  onHoverChange?: (hovered: number) => void;
  starSize?: number;
}

export default function StarRating({
  rating,
  count,
  interactive = false,
  onRatingChange,
  hoveredRating,
  onHoverChange,
  starSize = 16,
}: StarRatingProps) {
  const displayRating = interactive ? hoveredRating || rating : rating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`transition-colors ${interactive ? 'cursor-pointer' : ''} ${
              star <= displayRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            style={{ width: starSize, height: starSize }}
            onClick={interactive ? () => onRatingChange?.(star) : undefined}
            onMouseEnter={interactive ? () => onHoverChange?.(star) : undefined}
            onMouseLeave={interactive ? () => onHoverChange?.(0) : undefined}
          />
        ))}
      </div>
      {count && <span className="text-sm text-blue-600 hover:underline cursor-pointer">({count})</span>}
    </div>
  );
}