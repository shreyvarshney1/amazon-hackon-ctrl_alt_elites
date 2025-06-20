"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Order, OrderItem } from "@/types/order";

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token || !user || user.id === "guest") {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.orders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {orders.length === 0 ? (
        <p>You have no orders.</p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="border-b py-4">
              <div className="flex justify-between">
                <div>
                  <p>
                    <span className="font-bold">Order ID:</span> {order.id}
                  </p>
                  <p>
                    <span className="font-bold">Date:</span>{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-bold">Status:</span> {order.status}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {order.items.map((item: OrderItem) => (
                  <div key={item.id} className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="font-bold">{item.product_name}</p>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="ml-auto">
                      <p>
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(item.price_at_purchase)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
