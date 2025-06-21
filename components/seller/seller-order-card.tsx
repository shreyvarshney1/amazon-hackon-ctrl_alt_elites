// components/seller/seller-order-card.tsx

import { Order } from "@/types/order";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import SellerOrderItem from "./seller-order-item";

interface SellerOrderCardProps {
    order: Order;
    onActionSuccess: () => void;
}

export default function SellerOrderCard({ order, onActionSuccess }: SellerOrderCardProps) {
    return (
        <Card className="bg-white">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <p className="text-sm text-gray-500">
                            Placed by: {order.username} on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {order.items.map((item) => (
                    <SellerOrderItem key={item.id} item={item} orderId={order.id} onActionSuccess={onActionSuccess} />
                ))}
            </CardContent>
        </Card>
    );
}