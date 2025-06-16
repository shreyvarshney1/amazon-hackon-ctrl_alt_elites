import { Product } from "@/types/product";

export const mockProducts: Product[] = [
    {
        id: "iphone-12-pro-max-black",
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
            id : 1,
            name : "Apple India",
            seller_credibility_score : 0.8
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
        id: "samsung-galaxy-s24-ultra-black",
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
            id : 2,
            name : "Samsung India",
            seller_credibility_score : 0.4
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
        id: "nothing-phone-2a-plus",
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
            id : 4,
            name : "Nothing Technology",
            seller_credibility_score : 0.2
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
        id: "samsung-galaxy-zfold-3-black",
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
            id : 2,
            name : "Samsung India",
            seller_credibility_score : 0.4
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