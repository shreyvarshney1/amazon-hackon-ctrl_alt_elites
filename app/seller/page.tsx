// app/seller/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSellerAuth } from "@/context/seller-auth-context";
import Loader from "@/components/loader";

/**
 * A gatekeeper page for the /seller route.
 * 
 * This page's sole responsibility is to check the seller's authentication status
 * and redirect them to the appropriate page:
 * - The dashboard if they are already logged in.
 * - The login page if they are not.
 * 
 * It displays a loader while the authentication check is in progress.
 */
export default function SellerRootPage() {
  const { seller, isLoading } = useSellerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (seller && seller.id !== "guest") {
        router.replace("/seller/dashboard");
      } else {
        router.replace("/seller/login");
      }
    }
  }, [seller, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader text="Redirecting..." size={48} />
    </div>
  );
}