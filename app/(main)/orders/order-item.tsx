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
import StatusBadge from "@/components/status-badge";

interface OrderItemProps {
  item: OrderItemType;
  orderId: number;
  onActionSuccess: () => void;
}

export default function OrderItem({
  item,
  orderId,
  onActionSuccess,
}: OrderItemProps) {
  const { token } = useAuth();
  const [actionState, setActionState] = useState<{
    type: "cancelling" | "returning" | null;
    loading: boolean;
  }>({
    type: null,
    loading: false,
  });
  const [returnReason, setReturnReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (
    action: () => Promise<void>,
    type: "cancelling" | "returning",
  ) => {
    if (!token) return;
    setActionState({ type, loading: true });
    setError(null);
    try {
      await action();
      onActionSuccess();
    } catch (err) {
      console.error(`Action ${type} failed:`, err);
      setError(
        `${
          type === "cancelling" ? "Cancellation" : "Return"
        } failed. Please try again.`,
      );
    } finally {
      setActionState({ type: null, loading: false });
    }
  };

  const onReturn = () => {
    if (!returnReason.trim()) {
      setError("Please provide a reason for the return.");
      return;
    }
    handleAction(
      async () => {
        await returnOrderItem(token!, {
          order_id: orderId,
          product_id: item.product_id,
          reason: returnReason,
        });
      },
      "returning",
    );
  };

  const renderActionUI = () => {
    switch (item.status) {
      case "pending":
        return (
          <Button
            size="sm"
            onClick={() =>
              handleAction(
                async () => {
                  await cancelOrderItem(token!, orderId, item.product_id);
                },
                "cancelling",
              )
            }
            disabled={actionState.loading}
            variant="outline"
          >
            {actionState.loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Request Cancellation"
            )}
          </Button>
        );
      case "delivered":
        return (
          <div className="w-full space-y-2">
            <Textarea
              placeholder="Reason for return..."
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              disabled={actionState.loading}
            />
            <Button
              size="sm"
              className="w-full"
              onClick={onReturn}
              disabled={actionState.loading || !returnReason.trim()}
            >
              {actionState.type === "returning" ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Request Return"
              )}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-4 p-4 border-t first:border-t-0">
      <Image
        src={item.product_img || "/placeholder.svg"}
        alt={item.product_name}
        width={100}
        height={100}
        className="object-contain rounded bg-gray-50"
      />
      <div className="flex-grow">
        <Link
          href={`/products/${item.product_id}-${item.product_slug}`}
          className="font-semibold text-blue-600 hover:underline"
        >
          {item.product_name}
        </Link>
        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
        <p className="text-sm">Price: ₹{item.price_at_purchase.toFixed(2)}</p>
      </div>
      <div className="flex flex-col justify-between items-end w-56 gap-4">
        {renderActionUI()}
        <StatusBadge item={item} />
        {(item.status === "cancelled" || item.status === "returned") && (
          <p className="text-xs text-gray-500 italic">
            Refund pending seller approval.
          </p>
        )}
        {item.status === "refunded" && (
          <p className="text-xs text-green-600 italic">Refund processed.</p>
        )}
        {item.status === "refund_rejected" && (
          <p className="text-xs text-red-600 italic">
            Seller rejected the refund for this product.
          </p>
        )}
        {error && (
          <p className="text-xs text-red-500 text-right mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
