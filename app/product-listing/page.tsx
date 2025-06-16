"use client"

import { useState } from "react"
import { Search, MapPin, ShoppingCart, Menu, Star, ChevronDown } from "lucide-react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Checkbox } from "../components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import Image from "next/image"

export default function AmazonSearchPage() {
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]))
  }

  const StarRating = ({ rating, count }: { rating: number; count?: string }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`w-4 h-4 ${star <= rating ? "fill-[#ff9900] text-[#ff9900]" : "text-[#c9cccc]"}`} />
      ))}
      {count && <span className="text-[#0052b4] text-sm ml-1">{count}</span>}
    </div>
  )

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
              <Input className="flex-1 border-0 rounded-none bg-white text-black" defaultValue="Phone" />
              <Button className="bg-[#ff9900] hover:bg-[#f0a742] border-0 rounded-r-md rounded-l-none px-4">
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Account & Cart */}
          <div className="flex items-center gap-6 text-sm">
            <div>
              <div className="text-xs">Hello, John</div>
              <div className="font-bold">Accounts & Lists</div>
            </div>
            <div>
              <div className="text-xs">Returns</div>
              <div className="font-bold">& Orders</div>
            </div>
            <div className="flex items-center">
              <ShoppingCart className="w-6 h-6 mr-1" />
              <span className="bg-[#ff9900] text-black px-1 rounded text-xs font-bold">2</span>
              <span className="ml-1 font-bold">Cart</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-[#232f3f] px-4 py-2 border-t border-[#3a4553]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm">
              <Button variant="ghost" className="text-white hover:bg-[#3a4553] p-2">
                <Menu className="w-4 h-4 mr-2" />
                All
              </Button>
              <span className="hover:text-[#ff9900] cursor-pointer">Fashion</span>
              <span className="hover:text-[#ff9900] cursor-pointer">Mobiles</span>
              <span className="hover:text-[#ff9900] cursor-pointer">Gift Ideas</span>
              <span className="hover:text-[#ff9900] cursor-pointer flex items-center">
                Prime <ChevronDown className="w-3 h-3 ml-1" />
              </span>
              <span className="hover:text-[#ff9900] cursor-pointer">Amazon Pay</span>
              <span className="hover:text-[#ff9900] cursor-pointer">Gift Cards</span>
              <span className="hover:text-[#ff9900] cursor-pointer">Sports, Fitness & Outdoors</span>
              <span className="hover:text-[#ff9900] cursor-pointer">Computers</span>
              <span className="hover:text-[#ff9900] cursor-pointer">Customer Service</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-white font-bold text-lg">CINDRELLA</div>
              <div className="text-xs">
                <div className="text-[#ff9900]">JOIN PRIME NOW</div>
                <div className="text-[#c9cccc]">*Redirects to PrimeVideo.com</div>
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
            <div className="text-sm text-[#0052b4] mb-2">Smart Phones & Basic Mobiles</div>
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
              {["Samsung", "Realme", "Vivo", "Oppo", "Apple", "Xiaomi", "Redmi", "Sony"].map((brand) => (
                <div key={brand} className="flex items-center">
                  <Checkbox
                    id={brand}
                    checked={selectedBrands.includes(brand)}
                    onCheckedChange={() => toggleBrand(brand)}
                  />
                  <label htmlFor={brand} className="ml-2 text-sm cursor-pointer">
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
              <span className="font-bold">1-16</span> of over <span className="font-bold">2,000</span> results for{" "}
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
            {/* Samsung Galaxy Z Fold3 */}
            <div className="flex gap-4 p-4 border border-[#dddddd] rounded">
              <div className="w-48 h-48 bg-[#f0f0f0] rounded flex items-center justify-center">
                <Image
                  src="/products/thumbnails/samsung-galaxy-zfold.webp"
                  alt="Samsung Galaxy Z Fold3"
                  width={180}
                  height={180}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#565959] mb-1">Sponsored</div>
                <h3 className="text-lg text-[#0052b4] mb-2">
                  Samsung Galaxy Z Fold3 5G (Phantom Black, 12GB RAM, 256GB Storage) with No Cost EMI/ Additional
                  Exchange Offers
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#b12704]">₹1,49,999</span>
                  <span className="text-sm text-[#565959] line-through">₹1,71,999</span>
                  <span className="text-sm">Save ₹22,000 (13%)</span>
                </div>
                <div className="text-sm text-[#565959] mb-1">FREE Delivery by Amazon.</div>
                <div className="text-sm text-[#565959]">This item will be released on September 10, 2021.</div>
              </div>
            </div>

            {/* Apple iPhone 12 Pro Max */}
            <div className="flex gap-4 p-4 border border-[#dddddd] rounded">
              <div className="w-48 h-48 bg-[#f0f0f0] rounded flex items-center justify-center">
                <Image
                  src="/products/thumbnails/iphone-12-pro-max.webp"
                  alt="iPhone 12 Pro Max"
                  width={180}
                  height={180}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#565959] mb-1">Sponsored</div>
                <h3 className="text-lg text-[#0052b4] mb-2">Apple iPhone 12 Pro Max (128 GB) - Pacific Blue</h3>
                <div className="mb-2">
                  <StarRating rating={4} count="1,084" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#b12704]">₹1,15,900</span>
                  <span className="text-sm text-[#565959] line-through">₹1,29,000</span>
                  <span className="text-sm">Save ₹14,000 (11%)</span>
                </div>
                <div className="text-sm mb-1">
                  Get it by <span className="font-bold">Friday, September 10</span>
                </div>
                <div className="text-sm text-[#565959]">FREE Delivery by Amazon</div>
              </div>
            </div>

            {/* New Apple iPhone 12 Pro */}
            <div className="flex gap-4 p-4 border border-[#dddddd] rounded">
              <div className="w-48 h-48 bg-[#f0f0f0] rounded flex items-center justify-center">
                <Image
                  src="/products/thumbnails/iphone-12-gold.webp"
                  alt="iPhone 12 Pro Gold"
                  width={180}
                  height={180}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#565959] mb-1">Sponsored</div>
                <h3 className="text-lg text-[#0052b4] mb-2">New Apple iPhone 12 Pro (512 GB) - Gold</h3>
                <div className="mb-2">
                  <StarRating rating={4} count="570" />
                </div>
                <div className="mb-2">
                  <span className="bg-[#b12704] text-white px-2 py-1 text-xs rounded">Limited time deal</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-[#b12704]">₹1,39,900</span>
                  <span className="text-sm text-[#565959] line-through">₹1,49,000</span>
                  <span className="text-sm">Save ₹10,000 (7%)</span>
                </div>
                <div className="text-sm mb-1">
                  Get it by <span className="font-bold">Friday, September 10</span>
                </div>
                <div className="text-sm text-[#565959]">FREE Delivery by Amazon</div>
              </div>
            </div>

            {/* Samsung Galaxy Z Flip3 */}
            <div className="flex gap-4 p-4 border border-[#dddddd] rounded">
              <div className="w-48 h-48 bg-[#f0f0f0] rounded flex items-center justify-center">
                <Image
                  src="/products/thumbnails/samsung-galaxy-zflip.webp"
                  alt="Samsung Galaxy Z Flip3"
                  width={180}
                  height={180}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#565959] mb-1">Sponsored</div>
                <h3 className="text-lg text-[#0052b4] mb-2">
                  Samsung Galaxy Z Flip3 5G (Cream, 8GB RAM, 128GB Storage) with No Cost EMI/Additional
                </h3>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}