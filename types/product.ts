import { Review } from "./review";

export interface Product {
  id: string;
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
  last_pis_update: string;
  reviews?: Review[];
  rating?: number;
  reviewCount?: string;
  deliveryDate?: string;
  discount?: number;
  isSponsored?: boolean;
  isFreeDelivery?: boolean;
  currency?: string;
}
