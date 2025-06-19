"use client";

import { Star, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Review } from "@/types/review";

interface ReviewItemProps {
  review: Review;
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-[#ff9900] text-[#ff9900]" : "text-[#c9cccc]"
          }`}
        />
      ))}
    </div>
  );

  const getAvatarColor = (id: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
    ];
    const index = Number.parseInt(id.slice(-1)) % colors.length;
    return colors[index] || "bg-gray-500";
  };

  return (
    <div className="border-b border-[#e7e7e7] pb-6 mb-6">
      <div className="flex gap-4">
        {/* User Avatar */}
        <div
          className={`w-10 h-10 rounded-full ${getAvatarColor(
            review.id.toString()
          )} flex items-center justify-center text-white font-bold`}
        >
          <User className="w-5 h-5" />
        </div>

        <div className="flex-1">
          {/* User Info */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-[#333333]">
              {review.username}
            </span>
            {review.has_trusted_badge && (
              <CheckCircle className="w-4 h-4 text-green-600 fill-current" />
            )}
          </div>

          {/* Rating and Title */}
          <div className="flex items-center gap-2 mb-1">
            <StarRating rating={review.rating} />
            {review.title && (
              <span className="font-medium text-[#333333]">{review.title}</span>
            )}
          </div>

          {/* Review Date */}
          <div className="text-sm text-[#565959] mb-2">
            {review.created_at && (
              <span>
                Reviewed on {new Date(review.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Verified Purchase Badge */}
          {review.is_verified_purchase && (
            <div className="mb-3">
              <span className="bg-[#ff9900] text-white px-2 py-1 text-xs rounded font-medium">
                Verified Purchase
              </span>
            </div>
          )}

          {/* Review Text */}
          <div className="text-[#333333] mb-4 leading-relaxed">
            {review.review_text}
          </div>

          {/* Helpful Count */}
          {/* {review.helpful_count && review.helpful_count > 0 && (
            <div className="text-sm text-[#565959] mb-3">
              {review.helpful_count}{" "}
              {review.helpful_count === 1 ? "person" : "people"} found this
              helpful
            </div>
          )} */}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              className="text-[#333333] border-[#d5d9d9] hover:bg-[#f7f8f8]"
            >
              Helpful
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#0052b4] hover:bg-[#f7f8f8]"
            >
              Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
