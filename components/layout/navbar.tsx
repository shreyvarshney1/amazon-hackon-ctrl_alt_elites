"use client";

import Link from "next/link";
import { Search, Menu, ChevronDown, ShoppingCart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import UserStatus from "@/components/layout/user-status";
import AmazonLogo from "@/components/layout/amazon-logo";

function CartLink() {
  const { cartItems } = useCart();
  return (
    <Link
      href="/cart"
      className="flex items-center space-x-1 text-white p-2 rounded hover:text-[#ff9900] transition-colors"
    >
      <div className="relative">
        <ShoppingCart />
        {cartItems.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartItems.length}
          </div>
        )}
      </div>
      <span className="text-sm font-medium">Cart</span>
    </Link>
  );
}

export default function Navbar() {
  const authProps = useAuth();

  return (
    <header className="text-white flex flex-col items-center justify-center">
      <nav className="bg-[#131921] flex items-center p-2 w-full gap-4 leading-none justify-around">
        <Link href="/" className="text-white text-xl font-bold">
          <AmazonLogo className="w-30 h-8" color="#fff" />
        </Link>
        <div className="flex-1 max-w-2xl mx-4">
          <div className="flex">
             <Select defaultValue="all">
              <SelectTrigger className="w-16 bg-[#f3f3f3] text-black border-0 rounded-l-md rounded-r-none focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
            <Input
              className="flex-1 border-0 rounded-l-md rounded-none bg-white text-black focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:ring-orange-500"
              placeholder="Search Amazon"
            />
            <Button className="bg-[#febd69] hover:bg-[#f3a847] border-0 rounded-r-md rounded-l-none px-4">
              <Search className="text-[#2d2f32]" />
            </Button>
          </div>
        </div>

        <UserStatus {...authProps} />

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
      {/* Secondary Nav can be a separate component if it grows */}
      <nav className="bg-[#232f3e] px-4 w-full h-10 flex items-center justify-between font-semibold">
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
