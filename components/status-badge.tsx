import { OrderItem } from "@/types/order";

interface StatusBadgeProps {
  item: OrderItem;
}

export default function StatusBadge({ item }: StatusBadgeProps) {
  if (!item) {
    return null;
  }
  const { status, cancelled_by_seller } = item;

  let text = "Unknown";
  let className = "bg-gray-100 text-gray-800";

  switch (status) {
    case "pending":
      text = "Pending";
      className = "bg-yellow-100 text-yellow-800";
      break;
    case "delivered":
      text = "Delivered";
      className = "bg-green-100 text-green-800";
      break;
    case "returned":
      text = cancelled_by_seller
        ? "Cancelled by Seller"
        : "Return/Cancel Requested";
      className = cancelled_by_seller
        ? "bg-red-100 text-red-800"
        : "bg-blue-100 text-blue-800";
      break;
    case "refunded":
      text = "Refunded";
      className = "bg-gray-200 text-gray-800";
      break;
    case "refund_rejected":
      text = "Refund Rejected";
      className = "bg-pink-200 text-pink-800";
      break;
    case "cancelled":
      text = "Cancelled";
      className = "bg-red-100 text-red-800";
      break;
  }

  return (
    <span
      className={`px-2.5 py-1 text-xs font-medium rounded-full ${className}`}
    >
      {text}
    </span>
  );
}
