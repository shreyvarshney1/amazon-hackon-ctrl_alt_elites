// "use client";
// import React, { useEffect, useState } from "react";
// import { useAuth } from "@/context/auth-context";
// import { Order, OrderItem } from "@/types/order";

// const OrdersPage = () => {
//   const { user } = useAuth();
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       const token = localStorage.getItem("auth_token");
//       if (!token || !user || user.id === "guest") {
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await fetch("/api/orders/my-orders", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch orders");
//         }

//         const data = await response.json();
//         setOrders(data.orders);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//         setError("Failed to fetch orders. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [user]);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p className="text-red-500">{error}</p>;
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
//       {orders.length === 0 ? (
//         <p>You have no orders.</p>
//       ) : (
//         <div>
//           {orders.map((order) => (
//             <div key={order.id} className="border-b py-4">
//               <div className="flex justify-between">
//                 <div>
//                   <p>
//                     <span className="font-bold">Order ID:</span> {order.id}
//                   </p>
//                   <p>
//                     <span className="font-bold">Date:</span>{" "}
//                     {new Date(order.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div>
//                   <p>
//                     <span className="font-bold">Status:</span> {order.status}
//                   </p>
//                 </div>
//               </div>
//               <div className="mt-4">
//                 {order.items.map((item: OrderItem) => (
//                   <div key={item.id} className="flex items-center gap-4 mt-2">
//                     <div>
//                       <p className="font-bold">{item.product_name}</p>
//                       <p>Quantity: {item.quantity}</p>
//                     </div>
//                     <div className="ml-auto">
//                       <p>
//                         {new Intl.NumberFormat("en-IN", {
//                           style: "currency",
//                           currency: "INR",
//                         }).format(item.price_at_purchase)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrdersPage;

"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
// It's good practice to have shared types. Assuming these are updated.
import { Order, OrderItem } from "@/types/order";
import { Button } from "@/components/ui/button"; // Assuming use of shadcn/ui
import { Badge } from "@/components/ui/badge"; // Assuming use of shadcn/ui

// Helper component for displaying status with colors
const StatusBadge = ({ status }: { status: OrderItem["status"] }) => {
  const statusStyles: Record<OrderItem["status"], string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    delivered: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    returned: "bg-blue-100 text-blue-800 border-blue-300",
    refunded: "bg-gray-200 text-gray-800 border-gray-400",
  };
  return (
    <Badge variant="outline" className={`${statusStyles[status]} text-xs`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleAction = async (
    url: string,
    body: Record<string, any>,
    successMessage: string
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Action failed");
      }
      alert(successMessage);
      await fetchOrders(); // Refresh orders to show updated status
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelItem = (orderId: number, productId: number) => {
    if (!confirm("Are you sure you want to cancel this item?")) return;
    handleAction(
      "/api/orders/cancel-order",
      { order_id: orderId, product_id: productId },
      "Item cancelled successfully. A refund will be processed if applicable."
    );
  };

  const handleReturnItem = (productId: number, orderId: number) => {
    const reason = prompt("Please provide a reason for returning this item:");
    if (!reason) {
      alert("A reason is required to initiate a return.");
      return;
    }
    handleAction(
      "/api/orders/return-product",
      { product_id: productId, reason: reason, order_id: orderId },
      "Return initiated successfully. The seller will review your request."
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="container mx-auto p-4 text-red-500 text-center">{error}</p>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Your Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center border-2 border-dashed rounded-lg p-12">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg shadow-sm">
              <div className="bg-gray-50 p-4 rounded-t-lg border-b flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">Order #{order.id}</p>
                  <p className="text-sm text-gray-600">
                    Placed on: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <p className="font-bold text-lg">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(order.total_amount)}
                </p>
              </div>
              <div className="p-4 space-y-4">
                {order.items.map((item: OrderItem) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 py-2 border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-md">{item.product_name}</p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price:{" "}
                        {new Intl.NumberFormat("en-IN", {
                          style: "currency",
                          currency: "INR",
                        }).format(item.price_at_purchase)}
                      </p>
                    </div>
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <StatusBadge status={item.status} />
                      {item.status === "pending" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleCancelItem(order.id, item.product_id)
                          }
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Cancel Item"}
                        </Button>
                      )}
                      {item.status === "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReturnItem(item.product_id, order.id)}
                          disabled={loading}
                        >
                          {loading ? "Processing..." : "Return Item"}
                        </Button>
                      )}
                      {(item.status === "cancelled" ||
                        item.status === "returned") && (
                        <p className="text-xs text-gray-500 italic">
                          Refund pending seller approval.
                        </p>
                      )}
                      {item.status === "refunded" && (
                        <p className="text-xs text-green-600 italic">
                          Refund processed.
                        </p>
                      )}
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
