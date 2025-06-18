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
    name: string; // changed from title
    description: string;
    price: number;
    category: string;
    image_urls: string[];
    pis_score: number; // changed from pis
    listed_at: string;
    last_pis_update: string;
    // Remove fields not returned by API or make them optional
    reviews?: Review[];
    rating?: number;
    reviewCount?: string;
    deliveryDate?: string;
    discount?: number;
    isSponsored?: boolean;
    isFreeDelivery?: boolean;
    currency?: string;
}