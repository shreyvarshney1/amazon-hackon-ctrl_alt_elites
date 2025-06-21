// types/product.ts

import { Review } from "./review";

export interface Product {
  id: string; // This is a string as per your type def
  slug: string;
  seller: {
    id: string;
    name: string;
    scs_score: number;
    last_scs_update: string | null;
  };
  name: string;
  description: string;
  price: number;
  category: string;
  image_urls: string[];
  pis_score: number;
  listed_at: string;
  last_pis_update: string | null; // Can be null
  reviews?: Review[];
  rating?: number;
  review_count?: string;
  deliveryDate?: string;
  discount?: number;
  isSponsored?: boolean;
  isFreeDelivery?: boolean;
  currency?: string;
}

// Add the form data type here
export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  image_urls: string[];
}
