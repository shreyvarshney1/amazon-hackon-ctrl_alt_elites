"use client";
import Link from "next/link";
import { Search, Menu, ChevronDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";

function CartLink() {
  const { cartItems } = useCart();
  return (
    <Link
      href="/cart"
      className="flex items-center space-x-1 text-white p-2 rounded w-full hover:bg-[#3a4553] transition-colors"
    >
      <div className="relative">
        <ShoppingCart />
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {cartItems.length}
        </div>
      </div>
      <span className="text-sm font-medium">Cart</span>
    </Link>
  );
}

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/context/cart-context";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  return (
    <header className="text-white flex flex-col items-center justify-center">
      <nav className="bg-[#131921] flex items-center px-4 py-2 border-b border-[#3a4553] w-full gap-4 leading-none justify-around">
        <Link href="/" className="text-white text-xl font-bold">
          amazon
        </Link>
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

        {/* <div className="flex items-center mr-4 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <div>
              <div className="text-[#c9cccc] text-xs">Deliver to John</div>
              <div className="font-bold">Bangalore 560034</div>
            </div>
          </div> */}

        {isLoading ? (
          <div>Loading...</div>
        ) : user && user.id !== "guest" ? (
          <>
            <div>
              <div className="text-xs">Hello, {user.username}</div>
              <div className="font-bold">
                Accounts & Lists (UBA: {user.uba_score?.toFixed(2)})
              </div>
            </div>
            <Button onClick={logout} className="bg-red-500 hover:bg-red-600 cursor-pointer">
              Logout
            </Button>
          </>
        ) : (
          <Link
            href="/login"
            className="text-white hover:text-[#ff9900] cursor-pointer"
          >
            Login
          </Link>
        )}
        <Link
          href="/orders"
          className="flex flex-col items-start text-white hover:text-[#ff9900]"
        >
          <div className="text-xs">Returns</div>
          <div className="font-bold">& Orders</div>
        </Link>
        <div className="flex items-center">
          <CartLink />
        </div>
      </nav>
      <nav className="bg-[#232f3e] px-4 py-1 border-t border-[#3a4553] w-full h-9">
        <div className="flex items-center justify-around w-full gap-6 text-sm">
          <div className="flex items-center gap-2 px-2 rounded cursor-pointer hover:text-[#ff9900]">
            <Menu />
            All
          </div>
          <span className="hover:text-[#ff9900] cursor-pointer">Fashion</span>
          <span className="hover:text-[#ff9900] cursor-pointer">Mobiles</span>
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
          <span className="hover:text-[#ff9900] cursor-pointer">Computers</span>
          <span className="hover:text-[#ff9900] cursor-pointer">
            Customer Service
          </span>
        </div>
      </nav>
    </header>
  );
}
