import { Product } from "@/types/product";
import { Review } from "@/types/review";

export const mockProducts: Product[] = [
    {
        id: "1",
        slug: "iphone-12-pro-max-black",
        title: "Apple iPhone 15 Pro Max (256GB) - Natural Titanium Gold",
        description: "The iPhone 15 Pro Max features a stunning 6.7-inch Super Retina XDR display with ProMotion technology. Built with aerospace-grade titanium and powered by the A17 Pro chip, it delivers exceptional performance and battery life. Capture incredible photos with the advanced Pro camera system featuring 5x telephoto zoom.",
        price: 159900,
        imageUrls: [
            "/products/thumbnails/iphone-12-pro-max.webp",
            "/products/full/iphone-15-pro-max-gold-front.webp",
            "/products/full/iphone-15-pro-max-gold-back.webp",
            "/products/full/iphone-15-pro-max-gold-side.webp",
            "/products/full/iphone-15-pro-max-gold-camera.webp"
        ],
        // imageAlt: "iPhone 15 Pro Max Natural Titanium Gold",
        category: "Smartphones",
        seller: {
            id: "1",
            name: "Apple India",
            seller_credibility_score: 0.8
        },
        pis: 0.8, // Product Information Score
        rating: 4.5,
        reviewCount: "2,847",
        discount: 11,
        deliveryDate: "Tuesday, June 18",
        isSponsored: true,
        isFreeDelivery: true,
        currency: "₹"
    },
    {
        id: "2",
        slug: "samsung-galaxy-s24-ultra-black",
        title: "Samsung Galaxy S24 Ultra 5G (512GB) - Titanium Black",
        description: "The ultimate Galaxy experience with 512GB storage. Features Galaxy AI for intelligent photo editing, 200MP ProVisual engine, and titanium armor for enhanced durability. Perfect for power users who demand the best in mobile technology.",
        price: 139999,
        imageUrls: [
            "/products/thumbnails/samsung-s24-ultra-black.webp",
            "/products/full/samsung-s24-ultra-black-front.webp",
            "/products/full/samsung-s24-ultra-black-back.webp",
            "/products/full/samsung-s24-ultra-black-display.webp"
        ],
        // imageAlt: "Samsung Galaxy S24 Ultra Titanium Black",
        category: "Smartphones",
        seller: {
            id: "2",
            name: "Samsung India",
            seller_credibility_score: 0.4
        },
        pis: 0.7,
        rating: 4.5,
        reviewCount: "2,341",
        discount: 10,
        deliveryDate: "Wednesday, June 19",
        isSponsored: false,
        isFreeDelivery: true,
        currency: "₹"
    },
    {
        id : "3",
        slug: "nothing-phone-2a-plus",
        title: "Nothing Phone (2a) Plus 5G (256GB) - Black",
        description: "Experience the unique Glyph Interface with Nothing Phone (2a) Plus. Features a stunning transparent design, MediaTek Dimensity 7350 Pro 5G chipset, 50MP dual camera with ultra-wide lens, and Nothing OS 2.6 for a pure Android experience with innovative features.",
        price: 27999,
        imageUrls: [
            "/products/thumbnails/nothing-phone-2a-plus-black.webp",
            "/products/full/nothing-phone-2a-plus-black-front.webp",
            "/products/full/nothing-phone-2a-plus-black-back.webp",
            "/products/full/nothing-phone-2a-plus-glyph.webp",
            "/products/full/nothing-phone-2a-plus-transparent.webp"
        ],
        // imageAlt: "Nothing Phone (2a) Plus Black",
        category: "Smartphones",
        seller: {
            id: "4",
            name: "Nothing Technology",
            seller_credibility_score: 0.2
        },
        pis: 0.4,
        rating: 4.2,
        reviewCount: "847",
        discount: 12,
        deliveryDate: "Tuesday, June 18",
        isSponsored: true,
        isFreeDelivery: true,
        currency: "₹"
    },
    {
        id : "4",
        slug: "samsung-galaxy-zfold-3-black",
        title: "Samsung Galaxy Z Fold3 5G (256GB) - Phantom Black",
        description: "Unfold your world with the Samsung Galaxy Z Fold3. Features a 7.6-inch foldable Dynamic AMOLED display, enhanced durability with Armor Aluminum frame, S Pen compatibility, and powerful triple camera system. Perfect for multitasking and productivity on the go.",
        price: 89999,
        imageUrls: [
            "/products/thumbnails/samsung-zfold3-black.webp",
            "/products/full/samsung-zfold3-black-closed.webp",
            "/products/full/samsung-zfold3-black-open.webp",
            "/products/full/samsung-zfold3-black-multitask.webp",
            "/products/full/samsung-zfold3-black-spen.webp"
        ],
        // imageAlt: "Samsung Galaxy Z Fold3 Phantom Black",
        category: "Smartphones",
        seller: {
            id: "2",
            name: "Samsung India",
            seller_credibility_score: 0.4
        },
        pis: 0.3,
        rating: 4.1,
        reviewCount: "1,247",
        discount: 40,
        deliveryDate: "Friday, June 21",
        isSponsored: true,
        isFreeDelivery: true,
        currency: "₹"
    },
];


export const mockReviews: Review[] = [
    {
        id: "1",
        review_text:
            "I love this Zemic UV umbrella! It's compact, lightweight, and easy to carry. The automatic open and close button works smoothly. The 8 ribs make it strong against wind, and it doesn't flip inside out like other umbrellas. The UV protection is great for sunny days too. The carabiner handle is a fun and useful touch—it clips easily to my bag. It's perfect for both rain and sun. The size is just right for travel. I've used it many times, and it still looks new. Great for men or women. I'm really happy with this purchase. Highly recommend value for money!",
        rating: 5,
        author: {
            id: "1",
            username: "Khushi Kumari",
            has_trusted_badge: true,
        },
        title: "Best quality product 🥰",
        date: "13 May 2025",
        location: "India",
        verified_purchase: true,
        helpful_count: 3,
        productId: "1"
    },
    {
        id: "2",
        review_text:
            "I absolutely love this automatic umbrella! The one-touch open/close feature is a game-changer, making it super easy to use. It fits perfectly in my bag, and feels sturdy even in windy conditions. The canopy is high-quality and dries quickly, which is a huge plus. Worth every penny—highly recommend to anyone looking for a reliable, compact umbrella!",
        rating: 5,
        author: {
            id: "2",
            username: "Vaidehi Hulage",
            has_trusted_badge: false,
        },
        title: "Amazing product",
        date: "27 May 2025",
        location: "India",
        verified_purchase: true,
        helpful_count: 0,
        productId: "1"
    },
    {
        id: "3",
        review_text:
            "This umbrella exceeded my expectations! The build quality is excellent, and the automatic mechanism works flawlessly. The carabiner handle is innovative and very practical. It's windproof and the UV protection works great. Perfect size for travel and daily use. Highly recommended!",
        rating: 5,
        author: {
            id: "3",
            username: "Lalith Kumar R - 4046",
            has_trusted_badge: true,
        },
        title: "Perfect Umbrella - Durable, Stylish & Reliable!",
        date: "24 May 2025",
        location: "India",
        verified_purchase: true,
        helpful_count: 1,
        productId: "1"
    },
]