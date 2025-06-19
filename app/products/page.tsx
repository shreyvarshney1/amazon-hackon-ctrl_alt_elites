"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  ShoppingCart,
  Menu,
  Star,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// import Image from "next/image";

import ProductCard from "./product-card";
// import { mockProducts } from "@/lib/mockData";
import { getProducts } from "@/lib/api/product";
import { Product } from "@/types/product";
import UserAvatar from "./user-avatar";
import { useAuth } from "../auth-context";

export default function AmazonSearchPage() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const {user, logout} = useAuth();

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

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
      {count && <span className="text-[#0052b4] text-sm ml-1">{count}</span>}
    </div>
  );

  // API Integration : /api/products
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts()
      .then((products) => {
        setProducts(products)
        // console.log(products);
      })
      .catch((error) => console.error("Failed to fetch all products. " + error.message));
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#232f3f] text-white">
        <div className="flex items-center px-4 py-2 justify-around">
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
            <div>
              <div className="text-xs">Accounts</div>
              <div className="font-bold">& Lists</div>
            </div>
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

          {/* User Avatar  */}
          <UserAvatar username={user?.username ?? "Guest"} email={user?.email ?? "example@gmail.com"} onLogout={logout}/>

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

      {/* Main Content */}
      <main className="flex">
        {/* Sidebar */}
        <aside className="w-64 p-4 border-r border-[#dddddd]">
          <div className="mb-6">
            <h3 className="font-bold text-[#333333] mb-3">Department</h3>
            <div className="text-sm text-[#0052b4] mb-2">
              Smart Phones & Basic Mobiles
            </div>
            <div className="ml-4 space-y-1 text-sm">
              <div className="text-[#0052b4]">Smart Phones</div>
              <div className="text-[#0052b4]">Basic Mobiles</div>
            </div>
            <div className="text-[#0052b4] text-sm mt-2 flex items-center">
              <ChevronDown className="w-3 h-3 mr-1" />
              See all two department
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-[#333333] mb-3">Customer Review</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center text-sm">
                  <StarRating rating={rating} />
                  <span className="ml-2 text-[#0052b4]">& Up</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-[#333333] mb-3">Brand</h3>
            <div className="space-y-2">
              {[
                "Samsung",
                "Realme",
                "Vivo",
                "Oppo",
                "Apple",
                "Xiaomi",
                "Redmi",
                "Sony",
              ].map((brand) => (
                <div key={brand} className="flex items-center">
                  <Checkbox
                    id={brand}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <label
                    htmlFor={brand}
                    className="ml-2 text-sm cursor-pointer"
                  >
                    {brand}
                  </label>
                </div>
              ))}
            </div>
            <div className="text-[#0052b4] text-sm mt-2 flex items-center">
              <ChevronDown className="w-3 h-3 mr-1" />
              See more
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-[#333333] mb-3">Operating System</h3>
            <div className="space-y-2">
              {["Android", "Bada", "Blackberry", "iOS", "Symbian"].map((os) => (
                <div key={os} className="flex items-center">
                  <Checkbox id={os} />
                  <label htmlFor={os} className="ml-2 text-sm cursor-pointer">
                    {os}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[#333333] mb-3">Price</h3>
            <div className="space-y-1 text-sm">
              <div className="text-[#0052b4]">Under ₹1000</div>
              <div className="text-[#0052b4]">₹1000 - ₹5000</div>
              <div className="text-[#0052b4]">₹5000 - ₹10,000</div>
              <div className="text-[#0052b4]">₹10,000 - ₹20,000</div>
            </div>
          </div>
        </aside>

        {/* Product Results */}
        <div className="flex-1 p-4">
          {/* Results Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm">
              <span className="font-bold">1-16</span> of over{" "}
              <span className="font-bold">2,000</span> results for{" "}
              <span className="text-[#c45500] font-bold">Phone</span>
            </div>
            <Select defaultValue="featured">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Sort by: Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Listings */}
          <div className="space-y-4">
            {/* {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))} */}

            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
