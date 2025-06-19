export interface ReviewAuthor {
  id: string
  username: string
  has_trusted_badge: boolean
}
export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  username: string;
  has_trusted_badge: boolean;
  rating: number;
  review_text: string;
  is_verified_purchase: boolean;
  title: string;
  linguistic_authenticity_score: number;
  created_at: string; // ISO timestamp format
}
