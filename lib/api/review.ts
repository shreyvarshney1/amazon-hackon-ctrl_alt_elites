import { Review } from "@/types/review";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Function to fetch all the reviews
export async function getReviews(productId : string): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/reviews/${productId}`);

    if (!response.ok) {
        throw new Error("Failed to fetch reviews");
    }

    return await response.json();
}


// Function to post a review
export async function postReview(review: Omit<Review, "id">): Promise<Review> {

    const response = await fetch(`${API_BASE_URL}/event/review-posted`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user_id: review.author.id,
            product_id: review.productId,
            review_text: review.review_text,
            rating: review.rating
        })
    })

    if (!response.ok) {
        throw new Error("Failed to post new review.")
    }

    return await response.json();
}