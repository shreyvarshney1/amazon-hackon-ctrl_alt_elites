"use client";
import { useState } from "react";
import { OrderItem as OrderItemType } from "@/types/order";
import { useSellerAuth } from "@/context/seller-auth-context";
import {
  deliverOrderItem,
  cancelSellerOrderItem,
  processRefund,
  rejectRefund,
} from "@/lib/api/seller";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, PackageCheck, Ban, CheckCircle, XCircle } from "lucide-react";
import StatusBadge from "@/components/status-badge";

interface SellerOrderItemProps {
  item: OrderItemType;
  orderId: number;
  onActionSuccess: () => void;
}

type ActionType = "deliver" | "cancel" | "accept_refund" | "reject_refund";

export default function SellerOrderItem({
  item,
  orderId,
  onActionSuccess,
}: SellerOrderItemProps) {
  const { token, refreshSeller } = useSellerAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [onTime, setOnTime] = useState(false);

  const handleAction = async (
    action: () => Promise<unknown>,
    type: ActionType,
  ) => {
    if (!token) return;
    setIsLoading(true);
    setActionType(type);
    try {
      await action();
      onActionSuccess();
      refreshSeller();
    } catch (error) {
      console.error(`Action ${type} failed:`, error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const onDeliver = () =>
    handleAction(
      () => deliverOrderItem(token!, orderId, item.product_id, onTime),
      "deliver",
    );
  const onSellerCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel this item? This will automatically queue a refund.",
      )
    ) {
      handleAction(
        () => cancelSellerOrderItem(token!, orderId, item.product_id),
        "cancel",
      );
    }
  };
  const onAcceptRefund = () => {
    if (confirm("Are you sure you want to process this refund?"))
      handleAction(
        () => processRefund(token!, orderId, item.product_id),
        "accept_refund",
      );
  };
  const onRejectRefund = () => {
    if (confirm("Are you sure you want to reject this refund request?"))
      handleAction(
        () => rejectRefund(token!, orderId, item.product_id),
        "reject_refund",
      );
  };

  const renderSellerActions = () => {
    switch (item.status) {
      case "pending":
        return (
          <div className="flex-col items-center space-x-2 w-full">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`on-time-${item.id}`}
                onCheckedChange={(c) => setOnTime(!!c)}
                disabled={isLoading}
              />
              <Label htmlFor={`on-time-${item.id}`} className="text-sm">
                On-time
              </Label>
            </div>
            <div className="flex w-full gap-2">
              <Button
                onClick={onDeliver}
                disabled={isLoading}
                aria-label="Deliver"
                className="w-1/2"
              >
                {isLoading && actionType === "deliver" ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <div>Delivering...</div>
                  </>
                ) : (
                  <>
                    <PackageCheck className="h-4 w-4" />
                    <div>Deliver</div>
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={onSellerCancel}
                disabled={isLoading}
                aria-label="Cancel Item"
                className="w-1/2"
              >
                {isLoading && actionType === "cancel" ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <div>Cancelling...</div>
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4" />
                    <div>Cancel</div>
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      case "returned":
        return (
          <div className="flex w-full gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 w-1/2"
              onClick={onAcceptRefund}
              disabled={isLoading}
            >
              {isLoading && actionType === "accept_refund" ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Refund
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="w-1/2"
              onClick={onRejectRefund}
              disabled={isLoading}
            >
              {isLoading && actionType === "reject_refund" ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
          </div>
        );
      case "cancelled":
        return (
          <div className="flex w-full gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 w-1/2"
              onClick={onAcceptRefund}
              disabled={isLoading}
            >
              {isLoading && actionType === "accept_refund" ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Refund
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="w-1/2"
              onClick={onRejectRefund}
              disabled={isLoading}
            >
              {isLoading && actionType === "reject_refund" ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              Reject
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border-t pt-4 flex justify-between items-start gap-4">
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{item.product_name}</p>
        <p className="text-sm text-gray-600">
          Qty: {item.quantity} | Price: ₹{item.price_at_purchase.toFixed(2)}
        </p>
      </div>
      <div className="flex flex-col items-end space-y-2 w-64">
        <StatusBadge item={item} />
        {renderSellerActions()}
      </div>
    </div>
  );
}
