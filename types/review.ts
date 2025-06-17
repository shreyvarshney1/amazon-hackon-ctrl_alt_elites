export interface ReviewAuthor {
  id: string
  username: string
  has_trusted_badge: boolean
}

export interface Review {
  id: string
  review_text: string
  rating: number
  author: ReviewAuthor
  productId: string
  date?: string
  location?: string
  verified_purchase?: boolean
  helpful_count?: number
  title?: string
}