"use client";
import React, { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { createOrder } from "@/lib/api/orders";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount,
  } = useCart();
  const { user, token, redirectToLogin } = useAuth();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!token || !user || user.id === "guest") {
      redirectToLogin(); // Use the context function to save redirect path
      return;
    }

    setIsCheckingOut(true);
    setError(null);

    try {
      await createOrder(cartItems, token);
      clearCart();
      alert("Order placed successfully!");
      router.push("/orders");
    } catch (error) {
      console.error("Failed to place order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Your Shopping Cart</h1>
      {error && (
        <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <h2 className="text-xl text-gray-700">
            Your cart is currently empty.
          </h2>
          <p className="text-gray-500 mt-2">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between border-b py-4 gap-4"
              >
                <div className="flex items-start gap-4">
                  <Image
                    src={item.image_urls[0]}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="object-contain rounded-md bg-gray-50"
                  />
                  <div>
                    <Link
                      href={`/products/${item.id}-${item.slug}`}
                      className="font-semibold text-lg hover:text-orange-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-red-600 font-bold mt-1">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(item.price)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Quantity Changer */}
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-3"
                    >
                      -
                    </Button>
                    <span className="px-4 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-3"
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border rounded-lg p-6 bg-gray-50 sticky top-24">
              <h2 className="text-xl font-bold border-b pb-4 mb-4">
                Order Summary
              </h2>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: "INR",
                    }).format(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-4">
                <span>Total</span>
                <span>
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(cartTotal)}
                </span>
              </div>
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full mt-6 h-11 text-base"
              >
                {isCheckingOut ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={clearCart}
                className="w-full mt-2"
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
