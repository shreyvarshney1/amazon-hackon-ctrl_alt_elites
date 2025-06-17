"use client";
import { Product } from "@/types/product";

import { useState, useEffect } from "react";
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
import { Review, ReviewAuthor } from "@/types/review";
import { getReviews, postReview } from "@/lib/api/review";
import { mockReviews } from "@/lib/mockData";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  // const [quantity, setQuantity] = useState(1)

  const productImages = product.imageUrls;

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
  const [reviews, setReviews] = useState<Review[]>(mockReviews);

  const handleNewReview = async (newReview: Omit<Review, "id" | "author">) => {
    const author : ReviewAuthor = {
      id : "1",
      username : "John" , 
      has_trusted_badge : true
    }
    const modReview : Omit<Review, "id"> =  {author, ...newReview};
    // const createdReview = await postReview(modReview);

    console.log("New review submitted:", newReview);

    // setReviews([createdReview, ...reviews]);

    setReviews([{id : "69",  ...modReview}, ...reviews]);
  };

  // Fetch reviews asynchronously
  useEffect(() => {
    getReviews().then((reviews) => setReviews(reviews));
  }, []);

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
                src={product.imageUrls[0]}
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
            {product.seller.seller_credibility_score > 0.7 && (
              <VerifiedSellerBadge />
            )}
          </div>

          <h1 className="text-2xl font-normal mb-3 leading-tight">
            {product.title}
          </h1>

          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={product.rating} count={product.reviewCount} />
            {/* <span className="text-[#0052b4] text-sm hover:text-[#ff9900] cursor-pointer">
              Search this page
            </span> */}
          </div>

          {/* <div className="text-sm text-[#565959] mb-4">
            500+ bought in past month
          </div> */}

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#b12704] text-lg">
                {-(product.discount ?? 0)}
              </span>
              <span className="text-3xl font-normal">
                {product.currency + " " + product.price}
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
        <div className="w-80 border border-[#dddddd] rounded p-4 h-fit">
          <div className="text-3xl font-normal mb-2">
            {product.currency + " " + product.price}
            <sup>00</sup>
          </div>

          <div className="bg-[#232f3f] text-white px-2 py-1 text-xs inline-block rounded mb-2">
            ⚡ Fulfilled
          </div>

          <div className="text-sm mb-2">
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

          <div className="text-green-700 font-bold text-lg mb-2">In stock</div>

          <div className="space-y-2 text-sm mb-4">
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

          <Button className="w-full bg-[#ff9900] hover:bg-[#f0a742] text-black font-bold py-2 mb-2">
            Add to Cart
          </Button>

          <Button
            className="w-full text-black font-bold py-2 mb-2"
            style={{
              backgroundColor: `rgb(${Math.round(
                255 * (1 - product.pis)
              )}, ${Math.round(180 * product.pis)}, 80)`,
              fontWeight: 500,
            }}
          >
            <p>PIS : {product.pis}</p>
          </Button>

          <Button className="w-full bg-[#ff9900] hover:bg-[#f0a742] text-black font-bold py-2 mb-4">
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

            
      {/* Reviews Section */}
      <div className="px-4 py-2">
        <ReviewSection
          reviews={reviews}
          productId={product.id}
          onSubmitReview={handleNewReview}
        />
      </div>
    </div>
  );
}
