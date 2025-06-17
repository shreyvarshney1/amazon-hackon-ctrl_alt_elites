"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import ReviewItem from "./review-item";
import type { Review } from "@/types/review";

interface ReviewSectionProps {
  reviews: Review[];
  productId: string;
  onSubmitReview?: (
    review: Omit<Review, "id" | "author"> 
  ) => void;
}

export default function ReviewSection({
  reviews,
  productId,
  onSubmitReview,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  // const [authorName, setAuthorName] = useState("");

  const handleSubmitReview = () => {
    if (
      rating > 0 &&
      reviewText.trim() &&
      // authorName.trim() &&
      onSubmitReview
    ) {
      onSubmitReview({
        rating,
        title: reviewTitle,
        productId: productId,
        review_text: reviewText,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        location: "India",
        verified_purchase: true,
        helpful_count: 0,
      });

      // Reset form
      setRating(0);
      setReviewTitle("");
      setReviewText("");
      // setAuthorName("");
    }
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

        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Overall rating
            </label>
            <StarRating interactive={true} />
          </div>

          {/* Author Name */}
          {/* <div>
            <label className="block text-sm font-medium mb-2">Your name</label>
            <Input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Enter your name"
              className="max-w-md"
            />
          </div> */}

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
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitReview}
            disabled={!rating || !reviewText.trim()}
            className="bg-[#ff9900] hover:bg-[#f0a742] text-black font-medium px-6"
          >
            Submit
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
