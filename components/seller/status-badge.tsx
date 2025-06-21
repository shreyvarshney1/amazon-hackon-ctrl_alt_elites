// components/seller/status-badge.tsx

import { OrderItem } from "@/types/order";

interface StatusBadgeProps {
  status: OrderItem["status"];
}

const statusConfig: Record<
  OrderItem["status"],
  { text: string; className: string }
> = {
  pending: { text: "Pending", className: "bg-yellow-100 text-yellow-800" },
  delivered: { text: "Delivered", className: "bg-green-100 text-green-800" },
  cancelled: { text: "Cancelled", className: "bg-red-100 text-red-800" },
  returned: {
    text: "Return Requested",
    className: "bg-blue-100 text-blue-800",
  },
  refunded: { text: "Refunded", className: "bg-gray-200 text-gray-800" },
  refund_rejected: {
    text: "Refund Rejected",
    className: "bg-pink-200 text-pink-800",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    text: "Unknown",
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.text}
    </span>
  );
}
