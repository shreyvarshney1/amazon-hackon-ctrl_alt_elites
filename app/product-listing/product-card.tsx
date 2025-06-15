import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

const StarRating = ({ rating, count }: { rating: number; count: string }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-blue-600 hover:underline cursor-pointer">
        {count}
      </span>
    </div>
  );
};

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN").format(price);
  };

  const savings = product.originalPrice
    ? product.originalPrice - product.currentPrice
    : 0;

  return (
    <Link href={`/product-listing/${product.id}`} className="block">
      <Card className="flex flex-row gap-4 p-4 border border-[#dddddd] rounded hover:shadow-md transition-shadow duration-200">
        {/* Product Image */}
        <div className="w-48 h-48 bg-[#f0f0f0] rounded flex items-center justify-center">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            width={180}
            height={180}
            className="object-contain"
          />
        </div>

        {/* Product Details */}
        <div className="w-fit">
          {/* Sponsored Badge */}
          {product.isSponsored && (
            <Badge
              variant="secondary"
              className="text-xs text-[#565959] mb-1 bg-transparent border-none p-0 h-auto"
            >
              Sponsored
            </Badge>
          )}

          {/* Product Title */}
          <h3 className="text-lg text-[#0052b4] mb-2 hover:text-[#c7511f] transition-colors line-clamp-2">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="mb-2">
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>

          {/* Price Section */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-2xl font-bold text-[#b12704]">
              {product.currency}
              {formatPrice(product.currentPrice)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-[#565959] line-through">
                  {product.currency}
                  {formatPrice(product.originalPrice)}
                </span>
                {product.discount && (
                  <span className="text-sm">
                    Save {product.currency}
                    {formatPrice(savings)} ({product.discount}%)
                  </span>
                )}
              </>
            )}
          </div>

          {/* Delivery Information */}
          <div className="text-sm mb-1">
            Get it by <span className="font-bold">{product.deliveryDate}</span>
          </div>

          {product.isFreeDelivery && (
            <div className="text-sm text-[#565959]">
              FREE Delivery by Amazon
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
