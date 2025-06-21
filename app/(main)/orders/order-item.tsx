// components/orders/order-item.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { OrderItem as OrderItemType } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth-context";
import { cancelOrderItem, returnOrderItem } from "@/lib/api/orders";

interface OrderItemProps {
  item: OrderItemType;
  orderId: number;
  onActionSuccess: () => void; // Callback to refresh the entire orders list
}

export default function OrderItem({ item, orderId, onActionSuccess }: OrderItemProps) {
  const { token } = useAuth();
  // State to manage the loading status and type of the current action
  const [actionState, setActionState] = useState<{ type: 'cancelling' | 'returning' | null; loading: boolean }>({
    type: null,
    loading: false,
  });
  const [returnReason, setReturnReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!token) return;
    setActionState({ type: 'cancelling', loading: true });
    setError(null);
    try {
      await cancelOrderItem(token, orderId, item.product_id);
      onActionSuccess(); // Trigger a refresh of the orders list
    } catch (err) {
      console.error("Failed to cancel item:", err);
      setError("Cancellation failed. Please try again.");
    } finally {
      setActionState({ type: null, loading: false });
    }
  };

  const handleReturn = async () => {
    if (!token || !returnReason.trim()) return;
    setActionState({ type: 'returning', loading: true });
    setError(null);
    try {
      await returnOrderItem(token, {
        order_id: orderId,
        product_id: item.product_id,
        reason: returnReason,
      });
      onActionSuccess(); // Trigger a refresh of the orders list
    } catch (err) {
      console.error("Failed to return item:", err);
      setError("Return request failed. Please try again.");
    } finally {
      setActionState({ type: null, loading: false });
    }
  };

  const renderActionUI = () => {
    switch (item.status) {
      case 'pending':
        return (
          <Button size="sm" onClick={handleCancel} disabled={actionState.loading}>
            {actionState.type === 'cancelling' ? <Loader2 className="animate-spin" /> : 'Cancel Item'}
          </Button>
        );
      case 'delivered':
        return (
          <div className="w-full space-y-2">
            <Textarea
              placeholder="Reason for return (e.g., 'item is fake', 'not as described')."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              disabled={actionState.loading}
            />
            <Button size="sm" className="w-full" onClick={handleReturn} disabled={actionState.loading || !returnReason.trim()}>
              {actionState.type === 'returning' ? <Loader2 className="animate-spin" /> : 'Request Return'}
            </Button>
          </div>
        );
      case 'cancelled':
        return <p className="text-sm font-semibold text-red-600">Cancelled</p>;
      case 'returned':
        return <p className="text-sm font-semibold text-blue-600">Return Requested</p>;
      case 'refunded':
        return <p className="text-sm font-semibold text-green-600">Refunded</p>;
      case 'refund_rejected':
          return <p className="text-sm font-semibold text-red-700">Return Rejected</p>;
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 p-4 border-t first:border-t-0">
      <Image
        src={item.product_img || '/placeholder.svg'}
        alt={item.product_name}
        width={100}
        height={100}
        className="object-contain rounded bg-gray-50"
      />
      <div className="flex-grow">
        <Link href={`/products/${item.product_id}-${item.product_slug}`} className="font-semibold text-blue-600 hover:underline">
          {item.product_name}
        </Link>
        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
        <p className="text-sm">Price: ₹{item.price_at_purchase.toFixed(2)}</p>
        <p className="text-sm font-medium">
          Status: <span className="capitalize">{item.status.replace('_', ' ')}</span>
        </p>
      </div>
      <div className="flex flex-col gap-2 items-end w-56">
        {renderActionUI()}
        {error && <p className="text-xs text-red-500 text-right">{error}</p>}
      </div>
    </div>
  );
}