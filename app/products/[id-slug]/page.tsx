"use client";

// import { useState } from "react"
import { Search, MapPin, ShoppingCart, Menu, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { mockProducts } from "@/lib/mockData";
import ProductDetails from "./product-details";
import { use, useEffect, useState } from "react";
import { getProductById } from "@/lib/api/product";
import { Product } from "@/types/product";
// import { getProductById } from "@/lib/api/product";
// import Image from "next/image"

interface ProductPageProps {
  params: Promise<{ "id-slug": string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { user, logout, isLoading } = useAuth();
  const resolvedParams = use(params);
  const id = resolvedParams["id-slug"].split("-")[0];

  // const product = mockProducts.find((product) => product.id === id);

  // API Integration : /api/product/:id
  const [product, setProduct] = useState<Product>();

  useEffect(() => {
    getProductById(id)
      .then((product) => setProduct(product))
      .catch((error) =>
        console.error("Failed to fetch product." + error.message),
      );
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#232f3f] text-white">
        <div className="flex items-center px-4 py-2">
          {/* Amazon Logo */}
          <div className="flex items-center mr-4">
            <div className="text-white text-xl font-bold">amazon</div>
          </div>

          {/* Delivery Location */}
          <div className="flex items-center mr-4 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <div>
              <div className="text-[#c9cccc] text-xs">Deliver to John</div>
              <div className="font-bold">Bangalore 560034</div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="flex">
              <Select defaultValue="all">
                <SelectTrigger className="w-16 bg-[#f3f3f3] text-black border-0 rounded-l-md rounded-r-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                </SelectContent>
              </Select>
              <Input
                className="flex-1 border-0 rounded-none bg-white text-black"
                defaultValue="Phone"
              />
              <Button className="bg-[#ff9900] hover:bg-[#f0a742] border-0 rounded-r-md rounded-l-none px-4">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Account & Cart */}
          <div className="flex items-center gap-6 text-sm">
            {isLoading ? (
              <div>Loading...</div>
            ) : user && user.id !== "guest" ? (
              <>
                <div>
                  <div className="text-xs">Hello, {user.username}</div>
                  <div className="font-bold">Accounts & Lists</div>
                </div>
                <Button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
            <div>
              <div className="text-xs">Returns</div>
              <div className="font-bold">& Orders</div>
            </div>
            <div className="flex items-center">
              <ShoppingCart className="w-6 h-6 mr-1" />
              <span className="bg-[#ff9900] text-black px-1 rounded text-xs font-bold">
                2
              </span>
              <span className="ml-1 font-bold">Cart</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-[#232f3f] px-4 py-2 border-t border-[#3a4553]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <Button
                variant="ghost"
                className="text-white hover:bg-[#3a4553] p-2"
              >
                <Menu className="w-4 h-4 mr-2" />
                All
              </Button>
              <span className="hover:text-[#ff9900] cursor-pointer">
                Fashion
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer">
                Mobiles
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer">
                Gift Ideas
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer flex items-center">
                Prime <ChevronDown className="w-3 h-3 ml-1" />
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer">
                Amazon Pay
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer">
                Gift Cards
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer">
                Sports, Fitness & Outdoors
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer">
                Computers
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer">
                Customer Service
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white font-bold text-lg">CINDRELLA</div>
              <div className="text-xs">
                <div className="text-[#ff9900]">JOIN PRIME NOW</div>
                <div className="text-[#c9cccc]">
                  *Redirects to PrimeVideo.com
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      {/* <div className="px-4 py-2 text-sm text-[#565959]">
        <span className="hover:text-[#ff9900] cursor-pointer">Bags, Wallets and Luggage</span>
        <span className="mx-2">›</span>
        <span className="hover:text-[#ff9900] cursor-pointer">Travel Accessories</span>
        <span className="mx-2">›</span>
        <span className="hover:text-[#ff9900] cursor-pointer">Umbrellas</span>
        <span className="mx-2">›</span>
        <span className="hover:text-[#ff9900] cursor-pointer">Folding Umbrellas</span>
      </div> */}

      {product ? (
        <ProductDetails product={product} />
      ) : (
        <div className="p-8 text-center text-red-600">Product not found.</div>
      )}
    </div>
  );
}
