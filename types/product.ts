export interface Product {
    id: string;
    seller : {
        id : number,
        name : string,
        seller_credibility_score : number
    };
    title: string;
    description: string;
    price: number;
    category: string;
    imageUrls: string[];
    pis: number;
    rating: number;
    reviewCount: string;
    discount?: number;
    deliveryDate: string;
    isSponsored?: boolean;
    isFreeDelivery?: boolean;
    currency?: string;
    // currentPrice: number;
    // originalPrice?: number;
    // ... other fields
}