"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ReviewItem from "./review-item";
import type { Review } from "@/types/review";
import { useProtectedAction } from "@/app/protected-action";
// import { useAuth } from "@/app/auth-context";

interface ReviewSectionProps {
  reviews: Review[];
  onSubmitReview?: (
    review: Omit<
      Review,
      | "id"
      | "user_id"
      | "linguistic_authenticity_score"
      | "product_id"
      | "username"
      | "has_trusted_badge"
    >,
  ) => void;
}

export default function ReviewSection({
  reviews,
  onSubmitReview,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  
  const { executeProtectedAction, isAuthenticated } = useProtectedAction();
  // const { user } = useAuth();

  const handleSubmitReview = () => {
    executeProtectedAction(() => {
      if (
        rating > 0 &&
        reviewText.trim() &&
        onSubmitReview
      ) {
        onSubmitReview({
          rating,
          title: reviewTitle,
          review_text: reviewText,
          created_at: new Date().toISOString(),
          is_verified_purchase: true,
        });

        // Reset form
        setRating(0);
        setReviewTitle("");
        setReviewText("");
      }
    });
  };

  const StarRating = ({ interactive = false }: { interactive?: boolean }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            star <= (interactive ? hoveredRating || rating : rating)
              ? "fill-[#ff9900] text-[#ff9900]"
              : "text-[#c9cccc] hover:text-[#ff9900]"
          }`}
          onClick={interactive ? () => setRating(star) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Write a Review Section */}
      <div className="bg-white border border-[#dddddd] rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Write a customer review</h2>

        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <p className="text-blue-800 text-sm">
              Please <button 
                onClick={() => executeProtectedAction(() => {})}
                className="text-blue-600 underline hover:text-blue-800"
              >
                sign in
              </button> to write a review.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Overall rating
            </label>
            <StarRating interactive={isAuthenticated} />
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Add a headline
            </label>
            <Input
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              placeholder="What's most important to know?"
              className="max-w-md"
              disabled={!isAuthenticated}
            />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Add a written review
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you like or dislike? What did you use this product for?"
              className="min-h-[120px]"
              disabled={!isAuthenticated}
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitReview}
            disabled={!isAuthenticated || !rating || !reviewText.trim()}
            className="bg-[#ff9900] hover:bg-[#f0a742] text-black font-medium px-6"
          >
            {!isAuthenticated ? "Sign in to Submit" : "Submit"}
          </Button>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h2 className="text-xl font-bold mb-6">Customer reviews</h2>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-[#565959]">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div>
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}