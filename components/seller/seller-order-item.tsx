"use client";
import { useState } from "react";
import { OrderItem as OrderItemType } from "@/types/order";
import { useSellerAuth } from "@/context/seller-auth-context";
import { deliverOrderItem, cancelSellerOrderItem, processRefund, rejectRefund } from "@/lib/api/seller";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, PackageCheck, Ban, CheckCircle, XCircle } from "lucide-react";
import StatusBadge from "./status-badge";

interface SellerOrderItemProps {
    item: OrderItemType;
    orderId: number;
    onActionSuccess: () => void;
}

type ActionType = 'deliver' | 'cancel' | 'accept_refund' | 'reject_refund';

export default function SellerOrderItem({ item, orderId, onActionSuccess }: SellerOrderItemProps) {
    const { token, refreshSeller } = useSellerAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [actionType, setActionType] = useState<ActionType | null>(null);
    const [onTime, setOnTime] = useState(false);
    
    const handleAction = async (action: () => Promise<void>, type: ActionType) => {
        if (!token) return;
        setIsLoading(true);
        setActionType(type);
        try {
            await action();
            onActionSuccess();
            refreshSeller(); // Refresh seller to get latest SCS score
        } catch (error) {
            console.error(`Action ${type} failed:`, error);
            alert(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
        } finally {
            setIsLoading(false);
            setActionType(null);
        }
    };
    
    const onDeliver = () => handleAction(() => deliverOrderItem(token!, orderId, item.product_id, onTime), 'deliver');
    const onCancel = () => { if (confirm("Are you sure?")) handleAction(() => cancelSellerOrderItem(token!, orderId, item.product_id), 'cancel'); };
    const onAcceptRefund = () => { if (confirm("Are you sure?")) handleAction(() => processRefund(token!, orderId, item.product_id), 'accept_refund'); };
    const onRejectRefund = () => { if (confirm("Are you sure?")) handleAction(() => rejectRefund(token!, orderId, item.product_id), 'reject_refund'); };

    return (
        <div className="border-t pt-4 flex justify-between items-start gap-4">
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.product_name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity} | Price: ₹{item.price_at_purchase.toFixed(2)}</p>
            </div>
            <div className="flex flex-col items-end space-y-2 w-64">
                <StatusBadge status={item.status} />
                <div className="flex items-center space-x-2">
                    {item.status === 'pending' && (
                        <>
                            <div className="flex items-center space-x-2">
                                <Checkbox id={`on-time-${item.id}`} onCheckedChange={(c) => setOnTime(!!c)} disabled={isLoading} />
                                <Label htmlFor={`on-time-${item.id}`} className="text-sm">On-time</Label>
                            </div>
                            <Button size="sm" onClick={onDeliver} disabled={isLoading}>
                                {isLoading && actionType === 'deliver' ? <Loader2 className="animate-spin h-4 w-4" /> : <PackageCheck className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={onCancel} disabled={isLoading}>
                                {isLoading && actionType === 'cancel' ? <Loader2 className="animate-spin h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                        </>
                    )}
                    {item.status === 'returned' && (
                        <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onAcceptRefund} disabled={isLoading}>
                                {isLoading && actionType === 'accept_refund' ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={onRejectRefund} disabled={isLoading}>
                                {isLoading && actionType === 'reject_refund' ? <Loader2 className="animate-spin h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}