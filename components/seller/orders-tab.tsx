"use client";
import { useEffect, useState, useCallback } from "react";
import { useSellerAuth } from "@/context/seller-auth-context";
import { getSellerOrders } from "@/lib/api/seller";
import { Order } from "@/types/order";
import Loader from "@/components/loader";
import SellerOrderCard from "./seller-order-card";

interface OrdersTabProps {
  isReady: boolean;
}

export default function OrdersTab({ isReady }: OrdersTabProps) {
  const { token } = useSellerAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await getSellerOrders(token);
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isReady) {
      setIsLoading(true);
      fetchOrders();
    }
  }, [isReady, fetchOrders]);

  if (isLoading) {
    return <Loader text="Loading orders..." />;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        You have no orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <SellerOrderCard
          key={order.id}
          order={order}
          onActionSuccess={fetchOrders}
        />
      ))}
    </div>
  );
}
