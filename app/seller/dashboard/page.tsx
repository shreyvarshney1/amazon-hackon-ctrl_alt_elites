"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSellerAuth } from "@/context/seller-auth-context";
import Loader from "@/components/loader";
import SellerHeader from "@/components/seller/seller-header";
import DashboardTabs from "@/components/seller/dashboard-tabs";
import ProductsTab from "@/components/seller/products-tab";
import OrdersTab from "@/components/seller/orders-tab";

export default function SellerDashboard() {
  const { seller, isLoading: isAuthLoading } = useSellerAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  const isReady = !isAuthLoading && seller !== null && seller.id !== "guest";

  useEffect(() => {
    if (!isAuthLoading && (!seller || seller.id === "guest")) {
      router.push("/seller/login");
    }
  }, [seller, isAuthLoading, router]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Authenticating Seller..." size={48} />
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader seller={seller} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-8">
          {activeTab === "products" && <ProductsTab isReady={isReady} />}
          {activeTab === "orders" && <OrdersTab isReady={isReady} />}
        </div>
      </main>
    </div>
  );
}
