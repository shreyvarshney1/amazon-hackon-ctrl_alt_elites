"use client";
import { Product } from "@/types/product";

import { useState } from "react";
import { Star, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { VerifiedSellerBadge } from "../product-card";
import ReviewSection from "./review-section";
import { Review } from "@/types/review";
import { postReview } from "@/lib/api/review";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
// import { getReviews } from "@/lib/api/review";
// import { postReview } from "@/lib/api/review";
// import { mockReviews } from "@/lib/mockData";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  // const [quantity, setQuantity] = useState(1)

  const productImages = product.image_urls;

  const StarRating = ({
    rating,
    count,
  }: {
    rating: number;
    count?: string;
  }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-[#ff9900] text-[#ff9900]" : "text-[#c9cccc]"
          }`}
        />
      ))}
      {count && <span className="text-[#0052b4] text-sm ml-1">({count})</span>}
    </div>
  );

  // API Integration

  const [reviews, setReviews] = useState<Review[]>(product.reviews ?? []);

  const handleNewReview = async (
    newReview: Omit<
      Review,
      | "id"
      | "user_id"
      | "linguistic_authenticity_score"
      | "product_id"
      | "username"
      | "has_trusted_badge"
    >,
    productId: string,
  ) => {
    const createdReview = await postReview(newReview, productId);
    setReviews([createdReview, ...reviews]);
  };
  const { addToCart } = useCart();
  const router = useRouter();
  return (
    <div className="flex flex-col gap-8">
      <div className="flex px-4 py-4 gap-8">
        {/* Product Images */}
        <div className="flex gap-4">
          {/* Thumbnail Images */}
          <div className="flex flex-col gap-2">
            {productImages.map((image, index) => (
              <div
                key={index}
                className={`w-12 h-12 border-2 cursor-pointer rounded ${
                  selectedImage === index
                    ? "border-[#ff9900]"
                    : "border-[#dddddd]"
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Product ${index + 1}`}
                  width={48}
                  height={48}
                  className="object-contain rounded"
                />
              </div>
            ))}
          </div>

          {/* Main Product Image */}
          <div className="relative">
            <div className="w-[500px] h-[500px] border border-[#dddddd] rounded bg-white flex items-center justify-center">
              <Image
                src={product.image_urls[selectedImage]}
                alt="Zemic UV Umbrella"
                width={450}
                height={450}
                className="object-contain"
              />
              <Share className="absolute top-4 right-4 w-6 h-6 text-[#565959] cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 max-w-md">
          <div className="text-[#0052b4] flex gap-2  text-sm mb-2 hover:text-[#ff9900] cursor-pointer">
            <p> by {product.seller.name} </p>
            {product.seller.scs_score > 0.8 && <VerifiedSellerBadge />}
          </div>

          <h1 className="text-2xl font-normal mb-3 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mb-2">
            <StarRating
              rating={product.rating ?? 0}
              count={product.review_count ?? "0"}
            />
            {/* <span className="text-[#0052b4] text-sm hover:text-[#ff9900] cursor-pointer">
              Search this page
            </span> */}
          </div>

          {/* <div className="text-sm text-[#565959] mb-4">
            500+ bought in past month
          </div> */}

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl font-normal">
                {(product.currency ?? "₹") + " " + product.price}
              </span>
            </div>
            {/* <div className="text-sm text-[#565959]">
              M.R.P.: <span className="line-through">₹2,500</span>
            </div> */}
          </div>

          <div className="bg-[#232f3f] text-white px-2 py-1 text-xs inline-block rounded mb-2">
            ⚡ Fulfilled
          </div>
          <div className="text-sm mb-2">Inclusive of all taxes</div>

          <div className="bg-[#ff9900] text-black px-2 py-1 text-sm inline-block rounded mb-4">
            Coupon: Apply ₹20 coupon{" "}
            <span className="text-[#0052b4] underline">Terms</span> |{" "}
            <span className="text-[#0052b4] underline">Shop items ›</span>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-[#ff9900] rounded-full flex items-center justify-center">
                <span className="text-white text-xs">%</span>
              </div>
              <span className="font-bold">Offers</span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="border border-[#dddddd] rounded p-3">
                <div className="font-bold mb-1">Cashback</div>
                <div>
                  Upto ₹50.00 cashback as Amazon Pay balance on select cards
                </div>
              </div>
              <div className="border border-[#dddddd] rounded p-3">
                <div className="font-bold mb-1">Bank Offer</div>
                <div>Upto ₹1,250.00 discount on select Credit Cards</div>
              </div>
              <div className="border border-[#dddddd] rounded p-3">
                <div className="font-bold mb-1">Partner Offers</div>
                <div>Buy 2 or more and get 5% off on</div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Options */}
        <div className="w-80 border border-[#dddddd] rounded p-4 h-fit gap-4 flex flex-col">
          <div className="text-3xl font-normal mb-2">
            {(product.currency ?? "₹") + " " + product.price}
            <sup>00</sup>
          </div>

          <div className="bg-[#232f3f] text-white p-2 text-xs inline-block rounded">
            ⚡ Fulfilled
          </div>
          <div
            className="text-white p-2 text-xs inline-block rounded"
            style={{
              backgroundColor: `rgb(${Math.round(
                255 * (1 - product.pis_score),
              )}, ${Math.round(180 * product.pis_score)}, 80)`,
              fontWeight: 500,
            }}
          >
            ✨ Product Integrity Score : {product.pis_score}
          </div>

          <div className="text-sm">
            <span className="text-[#0052b4] font-bold">FREE delivery</span>{" "}
            {product.deliveryDate}.
            {/* <span className="text-[#0052b4] underline cursor-pointer">
              Details
            </span> */}
          </div>

          {/* <div className="flex items-center gap-1 text-sm mb-4">
            <MapPin className="w-4 h-4" />
            <span>Deliver to Athary - Kothri 466114</span>
          </div> */}

          <div className="text-green-700 font-bold text-lg">In stock</div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Ships from</span>
              <span>Amazon</span>
            </div>
            <div className="flex justify-between">
              <span>Sold by</span>
              <span className="text-[#0052b4]">Secure transaction</span>
            </div>
            <div className="flex justify-between">
              <span>Payment</span>
              <span className="text-[#0052b4]">Secure transaction</span>
            </div>
            <div className="flex justify-between">
              <span>Gift options</span>
              <span className="text-[#0052b4]">Available at checkout</span>
            </div>
          </div>

          <Button
            onClick={() => {
              addToCart(product);
            }}
            className="bg-yellow-300 rounded-4xl p-4 my-auto text-sm leading-none text-black hover:bg-yellow-400 transition-colors cursor-pointer w-full"
          >
            Add to Cart
          </Button>
          <Button
            onClick={() => {
              addToCart(product);
              router.push("/cart");
            }}
            className="bg-[#ffa41c] rounded-4xl p-4 my-auto text-sm leading-none text-black hover:bg-[#ff8400] transition-colors cursor-pointer w-full"
          >
            Buy Now
          </Button>

          <Select defaultValue="wishlist">
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wishlist">Add to Wish List</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="px-4 py-2">
        <ReviewSection
          reviews={reviews}
          productId={product.id.toString()}
          onSubmitReview={handleNewReview}
        />
      </div>
    </div>
  );
}
