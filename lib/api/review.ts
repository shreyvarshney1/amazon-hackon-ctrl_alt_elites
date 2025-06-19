import { Review } from "@/types/review";

const API_BASE_URL = '/api/products';

// Function to fetch all the reviews
export async function getReviews(productId: string): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/${productId}/reviews`);

    if (!response.ok) {
        throw new Error("Failed to fetch reviews");
    }

    const data = await response.json();

    return data.reviews;
}


// Function to post a review
export async function postReview(review: Omit<
    Review,
    "id" | "user_id" | "linguistic_authenticity_score" | "username" | "has_trusted_badge"
>): Promise<Review> {
    
    const token = localStorage.getItem("auth_token");

    if (!token) {
        throw new Error("No auth token available!");
    }

    const response = await fetch(`${API_BASE_URL}/${review.product_id}/add-review`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            review_text: review.review_text,
            rating: review.rating,
            is_verified_purchase: review.is_verified_purchase,
            title: review.title
        })
    })

    if (!response.ok) {
        throw new Error("Failed to post new review.")
    }

    const data = await response.json();

    return data.review;
}
