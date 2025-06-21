// app/orders/page.tsx

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { getMyOrders } from "@/lib/api/orders";
import { Order } from "@/types/order";
import Loader from "@/components/loader";
import OrderCard from "@/app/(main)/orders/order-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OrdersPage() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    // Don't set loading true for refetches, to avoid screen flashing
    // setIsLoading(true);
    setError(null);
    try {
      const fetchedOrders = await getMyOrders(token);
      // Sort orders by most recent first
      fetchedOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(fetchedOrders);
    } catch (err) {
      setError("Failed to fetch your orders. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchOrders]);

  if (isLoading) {
    return <Loader text="Fetching your orders..." />;
  }
  
  if (!token || user?.id === 'guest') {
    return (
        <div className="text-center p-8">
            <h2 className="text-xl font-semibold mb-4">Please log in to see your orders.</h2>
            <Button asChild>
                <Link href="/login">Login</Link>
            </Button>
        </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{error}</p>
        <Button onClick={() => { setIsLoading(true); fetchOrders(); }} className="mt-4">
            Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-600 p-8">
        <h2 className="text-xl font-semibold">You have no past orders.</h2>
        <p className="mt-2">Start shopping to see your orders here.</p>
      </div>
    );
  }

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} onActionSuccess={fetchOrders} />
        ))}
      </div>
    </main>
  );
}