export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    imageUrls: string[];
    imageAlt: string;
    category: string;
    sellerName: string;
    pis: number;
    rating: number;
    reviewCount: string;
    currentPrice: number;
    originalPrice?: number;
    discount?: number;
    deliveryDate: string;
    isSponsored?: boolean;
    isFreeDelivery?: boolean;
    currency?: string;
    // ... other fields
}