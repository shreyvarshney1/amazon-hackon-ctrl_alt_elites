"use client";
import React, { useState } from "react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { createOrder } from "@/lib/api/orders";
import { useRouter } from "next/navigation";

const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    const token = localStorage.getItem("auth_token");
    if (!token || !user || user.id === "guest") {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createOrder(cartItems, token);
      clearCart();
      router.push("/orders");
    } catch (error) {
      console.error("Failed to place order:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Shopping Cart</h1>
      {error && <p className="text-red-500">{error}</p>}
      {cartItems.length === 0 ? (
        <p>Your cart is currently empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={item.image_urls[0]}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <div>
                  <h2 className="font-bold">{item.name}</h2>
                  <p>Quantity: {item.quantity}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p>
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(item.price * item.quantity)}
                </p>
                <Button
                  variant="destructive"
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
          <div className="flex justify-end items-center mt-4">
            <h2 className="text-xl font-bold">
              Total:{" "}
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
              }).format(total)}
            </h2>
          </div>
          <div className="flex justify-end mt-4 gap-4">
            <Button variant="secondary" onClick={clearCart}>
              Clear Cart
            </Button>
            <Button onClick={handleCheckout} disabled={loading}>
              {loading ? "Placing Order..." : "Proceed to Checkout"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
