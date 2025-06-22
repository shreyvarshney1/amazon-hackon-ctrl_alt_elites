"use client";
import { Product } from "@/types/product";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { VerifiedSellerBadge } from "../product-card";
import ReviewSection from "./review-section";
import { useCart } from "@/context/cart-context";
import { useRouter } from "next/navigation";
import StarRating from "@/components/star-rating";
import { ScoreTooltip } from "@/components/score-tooltip";

interface ProductDetailProps {
  product: Product;
  onProductUpdate: () => void; // Callback to refresh product data
}

export default function ProductDetails({
  product,
  onProductUpdate,
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const router = useRouter();

  const handleReviewSubmissionSuccess = () => {
    onProductUpdate();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap px-4 py-4 gap-8">
        {/* Image Section */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {product.image_urls.map((image, index) => (
              <div
                key={index}
                className={`w-12 h-12 border-2 cursor-pointer rounded ${
                  selectedImage === index
                    ? "border-[#ff9900]"
                    : "border-transparent"
                }`}
                onMouseEnter={() => setSelectedImage(index)}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Product thumbnail ${index + 1}`}
                  width={48}
                  height={48}
                  className="object-contain rounded"
                />
              </div>
            ))}
          </div>
          <div className="relative w-[500px] h-[500px] border border-gray-200 rounded flex items-center justify-center">
            <Image
              src={product.image_urls[selectedImage]}
              alt={product.name}
              fill
              className="object-contain p-4"
            />
            <Share className="absolute top-4 right-4 w-6 h-6 text-gray-500 cursor-pointer" />
          </div>
        </div>

        {/* Product Info Section */}
        <div className="flex-1 max-w-md gap-2 flex flex-col">
          <h1 className="text-2xl font-normal leading-tight">{product.name}</h1>
          <StarRating
            rating={product.rating ?? 0}
            count={product.review_count ?? "0"}
          />
          <div className="flex items-center gap-2">
            <span className="text-3xl font-normal">
              {(product.currency ?? "₹") + " " + product.price}
            </span>
          </div>
          <div className="bg-[#3e4650] text-white p-2 text-xs rounded flex items-center gap-1 tracking-wide w-fit">
            <svg
              height="10"
              viewBox="2.167 .438 251.038 259.969"
              width="10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="none" fillRule="evenodd">
                <path
                  d="m221.503 210.324c-105.235 50.083-170.545 8.18-212.352-17.271-2.587-1.604-6.984.375-3.169 4.757 13.928 16.888 59.573 57.593 119.153 57.593 59.621 0 95.09-32.532 99.527-38.207 4.407-5.627 1.294-8.731-3.16-6.872zm29.555-16.322c-2.826-3.68-17.184-4.366-26.22-3.256-9.05 1.078-22.634 6.609-21.453 9.93.606 1.244 1.843.686 8.06.127 6.234-.622 23.698-2.826 27.337 1.931 3.656 4.79-5.57 27.608-7.255 31.288-1.628 3.68.622 4.629 3.68 2.178 3.016-2.45 8.476-8.795 12.14-17.774 3.639-9.028 5.858-21.622 3.71-24.424z"
                  fill="#f90"
                  fillRule="nonzero"
                />
                <path
                  d="m150.744 108.13c0 13.141.332 24.1-6.31 35.77-5.361 9.489-13.853 15.324-23.341 15.324-12.952 0-20.495-9.868-20.495-24.432 0-28.75 25.76-33.968 50.146-33.968zm34.015 82.216c-2.23 1.992-5.456 2.135-7.97.806-11.196-9.298-13.189-13.615-19.356-22.487-18.502 18.882-31.596 24.527-55.601 24.527-28.37 0-50.478-17.506-50.478-52.565 0-27.373 14.85-46.018 35.96-55.126 18.313-8.066 43.884-9.489 63.43-11.718v-4.365c0-8.018.616-17.506-4.08-24.432-4.128-6.215-12.003-8.777-18.93-8.777-12.856 0-24.337 6.594-27.136 20.257-.57 3.037-2.799 6.026-5.835 6.168l-32.735-3.51c-2.751-.618-5.787-2.847-5.028-7.07 7.543-39.66 43.36-51.616 75.43-51.616 16.415 0 37.858 4.365 50.81 16.795 16.415 15.323 14.849 35.77 14.849 58.02v52.565c0 15.798 6.547 22.724 12.714 31.264 2.182 3.036 2.657 6.69-.095 8.966-6.879 5.74-19.119 16.415-25.855 22.393l-.095-.095"
                  fill="#000"
                />
                <path
                  d="m221.503 210.324c-105.235 50.083-170.545 8.18-212.352-17.271-2.587-1.604-6.984.375-3.169 4.757 13.928 16.888 59.573 57.593 119.153 57.593 59.621 0 95.09-32.532 99.527-38.207 4.407-5.627 1.294-8.731-3.16-6.872zm29.555-16.322c-2.826-3.68-17.184-4.366-26.22-3.256-9.05 1.078-22.634 6.609-21.453 9.93.606 1.244 1.843.686 8.06.127 6.234-.622 23.698-2.826 27.337 1.931 3.656 4.79-5.57 27.608-7.255 31.288-1.628 3.68.622 4.629 3.68 2.178 3.016-2.45 8.476-8.795 12.14-17.774 3.639-9.028 5.858-21.622 3.71-24.424z"
                  fill="#f90"
                  fillRule="nonzero"
                />
                <path
                  d="m150.744 108.13c0 13.141.332 24.1-6.31 35.77-5.361 9.489-13.853 15.324-23.341 15.324-12.952 0-20.495-9.868-20.495-24.432 0-28.75 25.76-33.968 50.146-33.968zm34.015 82.216c-2.23 1.992-5.456 2.135-7.97.806-11.196-9.298-13.189-13.615-19.356-22.487-18.502 18.882-31.596 24.527-55.601 24.527-28.37 0-50.478-17.506-50.478-52.565 0-27.373 14.85-46.018 35.96-55.126 18.313-8.066 43.884-9.489 63.43-11.718v-4.365c0-8.018.616-17.506-4.08-24.432-4.128-6.215-12.003-8.777-18.93-8.777-12.856 0-24.337 6.594-27.136 20.257-.57 3.037-2.799 6.026-5.835 6.168l-32.735-3.51c-2.751-.618-5.787-2.847-5.028-7.07 7.543-39.66 43.36-51.616 75.43-51.616 16.415 0 37.858 4.365 50.81 16.795 16.415 15.323 14.849 35.77 14.849 58.02v52.565c0 15.798 6.547 22.724 12.714 31.264 2.182 3.036 2.657 6.69-.095 8.966-6.879 5.74-19.119 16.415-25.855 22.393l-.095-.095"
                  fill="#fff"
                />
              </g>
            </svg>
            Fulfilled
          </div>
          <div className="text-sm">Inclusive of all taxes</div>

          <ScoreTooltip scoreType="PIS" scoreValue={product.pis_score}>
            <p
              className="text-white p-2 text-sm inline-block rounded font-medium tracking-wider"
              style={{
                backgroundColor: `rgb(${Math.round(
                  255 * (1 - product.pis_score),
                )}, ${Math.round(180 * product.pis_score)}, 80)`,
              }}
            >
              ✨ Product Integrity Score: {product.pis_score.toFixed(2)}
            </p>
          </ScoreTooltip>

          <div className="bg-[#ff9900] text-black px-2 py-1 text-sm inline-block rounded">
            Coupon: Apply ₹20 coupon{" "}
            <span className="text-[#0052b4] underline">Terms</span> |{" "}
            <span className="text-[#0052b4] underline">Shop items ›</span>
          </div>

          <div className="flex items-center gap-2">
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

        <div className="w-64 border border-[#dddddd] rounded p-4 h-fit gap-4 flex flex-col">
          <div className="text-3xl font-normal">
            <sup className="text-base">₹</sup>
            {product.price}
            <sup className="text-base">00</sup>
          </div>

          <div className="bg-[#3e4650] text-white p-2 text-sm rounded flex items-center gap-2 tracking-wider">
            <svg
              height="20"
              viewBox="2.167 .438 251.038 259.969"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g fill="none" fillRule="evenodd">
                <path
                  d="m221.503 210.324c-105.235 50.083-170.545 8.18-212.352-17.271-2.587-1.604-6.984.375-3.169 4.757 13.928 16.888 59.573 57.593 119.153 57.593 59.621 0 95.09-32.532 99.527-38.207 4.407-5.627 1.294-8.731-3.16-6.872zm29.555-16.322c-2.826-3.68-17.184-4.366-26.22-3.256-9.05 1.078-22.634 6.609-21.453 9.93.606 1.244 1.843.686 8.06.127 6.234-.622 23.698-2.826 27.337 1.931 3.656 4.79-5.57 27.608-7.255 31.288-1.628 3.68.622 4.629 3.68 2.178 3.016-2.45 8.476-8.795 12.14-17.774 3.639-9.028 5.858-21.622 3.71-24.424z"
                  fill="#f90"
                  fillRule="nonzero"
                />
                <path
                  d="m150.744 108.13c0 13.141.332 24.1-6.31 35.77-5.361 9.489-13.853 15.324-23.341 15.324-12.952 0-20.495-9.868-20.495-24.432 0-28.75 25.76-33.968 50.146-33.968zm34.015 82.216c-2.23 1.992-5.456 2.135-7.97.806-11.196-9.298-13.189-13.615-19.356-22.487-18.502 18.882-31.596 24.527-55.601 24.527-28.37 0-50.478-17.506-50.478-52.565 0-27.373 14.85-46.018 35.96-55.126 18.313-8.066 43.884-9.489 63.43-11.718v-4.365c0-8.018.616-17.506-4.08-24.432-4.128-6.215-12.003-8.777-18.93-8.777-12.856 0-24.337 6.594-27.136 20.257-.57 3.037-2.799 6.026-5.835 6.168l-32.735-3.51c-2.751-.618-5.787-2.847-5.028-7.07 7.543-39.66 43.36-51.616 75.43-51.616 16.415 0 37.858 4.365 50.81 16.795 16.415 15.323 14.849 35.77 14.849 58.02v52.565c0 15.798 6.547 22.724 12.714 31.264 2.182 3.036 2.657 6.69-.095 8.966-6.879 5.74-19.119 16.415-25.855 22.393l-.095-.095"
                  fill="#000"
                />
                <path
                  d="m221.503 210.324c-105.235 50.083-170.545 8.18-212.352-17.271-2.587-1.604-6.984.375-3.169 4.757 13.928 16.888 59.573 57.593 119.153 57.593 59.621 0 95.09-32.532 99.527-38.207 4.407-5.627 1.294-8.731-3.16-6.872zm29.555-16.322c-2.826-3.68-17.184-4.366-26.22-3.256-9.05 1.078-22.634 6.609-21.453 9.93.606 1.244 1.843.686 8.06.127 6.234-.622 23.698-2.826 27.337 1.931 3.656 4.79-5.57 27.608-7.255 31.288-1.628 3.68.622 4.629 3.68 2.178 3.016-2.45 8.476-8.795 12.14-17.774 3.639-9.028 5.858-21.622 3.71-24.424z"
                  fill="#f90"
                  fillRule="nonzero"
                />
                <path
                  d="m150.744 108.13c0 13.141.332 24.1-6.31 35.77-5.361 9.489-13.853 15.324-23.341 15.324-12.952 0-20.495-9.868-20.495-24.432 0-28.75 25.76-33.968 50.146-33.968zm34.015 82.216c-2.23 1.992-5.456 2.135-7.97.806-11.196-9.298-13.189-13.615-19.356-22.487-18.502 18.882-31.596 24.527-55.601 24.527-28.37 0-50.478-17.506-50.478-52.565 0-27.373 14.85-46.018 35.96-55.126 18.313-8.066 43.884-9.489 63.43-11.718v-4.365c0-8.018.616-17.506-4.08-24.432-4.128-6.215-12.003-8.777-18.93-8.777-12.856 0-24.337 6.594-27.136 20.257-.57 3.037-2.799 6.026-5.835 6.168l-32.735-3.51c-2.751-.618-5.787-2.847-5.028-7.07 7.543-39.66 43.36-51.616 75.43-51.616 16.415 0 37.858 4.365 50.81 16.795 16.415 15.323 14.849 35.77 14.849 58.02v52.565c0 15.798 6.547 22.724 12.714 31.264 2.182 3.036 2.657 6.69-.095 8.966-6.879 5.74-19.119 16.415-25.855 22.393l-.095-.095"
                  fill="#fff"
                />
              </g>
            </svg>
            Fulfilled
          </div>

          <ScoreTooltip scoreType="PIS" scoreValue={product.pis_score}>
            <div
              className="text-white p-2 text-sm inline-block rounded tracking-wider"
              style={{
                backgroundColor: `rgb(${Math.round(
                  255 * (1 - product.pis_score),
                )}, ${Math.round(180 * product.pis_score)}, 80)`,
                fontWeight: 500,
              }}
            >
              ✨ PIS : {product.pis_score.toFixed(2)}
            </div>
          </ScoreTooltip>

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
              <div className="text-[#0052b4] flex-col gap-2  text-sm hover:text-[#ff9900] cursor-pointer">
                {product.seller.scs_score > 0.8 && <VerifiedSellerBadge />}
                {product.seller.name}
              </div>
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
          initialReviews={product.reviews ?? []}
          productId={product.id.toString()}
          onReviewSubmitSuccess={handleReviewSubmissionSuccess}
        />
      </div>
    </div>
  );
}
