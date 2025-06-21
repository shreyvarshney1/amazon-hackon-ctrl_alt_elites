// components/orders/order-card.tsx

import { Order } from "@/types/order";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import OrderItem from "./order-item";

interface OrderCardProps {
  order: Order;
  onActionSuccess: () => void;
}

export default function OrderCard({ order, onActionSuccess }: OrderCardProps) {
  return (
    <Card className="overflow-hidden p-0">
      <CardHeader className="bg-gray-100 flex flex-row justify-between items-center p-4">
        <div className="text-sm">
          <p className="uppercase text-gray-600">Order Placed</p>
          <p>{new Date(order.created_at).toLocaleDateString('en-GB')}</p>
        </div>
        <div className="text-sm">
          <p className="uppercase text-gray-600">Total</p>
          <p className="font-bold">₹{order.total_amount.toFixed(2)}</p>
        </div>
        <div className="text-sm text-right">
          <p className="uppercase text-gray-600">Order # {order.id}</p>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {order.items.map(item => (
          <OrderItem 
            key={item.id} 
            item={item} 
            orderId={order.id} 
            onActionSuccess={onActionSuccess} 
          />
        ))}
      </CardContent>
    </Card>
  );
}