"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ReviewItem from "./review-item";
import type { Review } from "@/types/review";
import StarRating from "@/components/star-rating";
import { postReview } from "@/lib/api/review";
import { Loader2 } from "lucide-react";

interface ReviewSectionProps {
  initialReviews: Review[];
  productId: string;
  onReviewSubmitSuccess: () => void;
}

export default function ReviewSection({
  initialReviews,
  productId,
  onReviewSubmitSuccess,
}: ReviewSectionProps) {
  const { user, token, refreshUser } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (!token || !rating || !reviewText.trim() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const newReviewData = {
        rating,
        title: reviewTitle,
        review_text: reviewText,
      };
      
      await postReview(newReviewData, productId);
      
      setRating(0);
      setReviewTitle("");
      setReviewText("");
      
      onReviewSubmitSuccess(); 
      refreshUser();

    } catch (err) {
      console.error(err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  // If parent provides new initialReviews, update local state
  if (reviews.length !== initialReviews.length || (reviews[0] && initialReviews[0] && reviews[0].id !== initialReviews[0].id)) {
      setReviews(initialReviews);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Write a Review Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Write a customer review</h2>
        {user && user.id !== "guest" ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Overall rating</label>
              <StarRating
                interactive
                rating={rating}
                onRatingChange={setRating}
                hoveredRating={hoveredRating}
                onHoverChange={setHoveredRating}
                starSize={24}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Add a headline</label>
              <Input
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="What's most important to know?"
                className="max-w-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Add a written review</label>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you like or dislike?"
                className="min-h-[120px]"
              />
            </div>
            
            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              onClick={handleSubmitReview}
              disabled={!rating || !reviewText.trim() || isSubmitting}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        ) : (
          <div>
            <p>Please <Link href="/login" className="text-blue-600 hover:underline">log in</Link> to write a review.</p>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div>
        <h2 className="text-xl font-bold mb-6">Customer reviews</h2>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
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