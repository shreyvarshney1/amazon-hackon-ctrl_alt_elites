"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSellerAuth } from "@/context/seller-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SellerDashboard() {
  const { seller, isLoading, logout } = useSellerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!seller || seller.id === "guest")) {
      router.push("/seller/login");
    }
  }, [seller, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  if (!seller || seller.id === "guest") {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Amazon Seller Central
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {seller.name}
              </span>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Manage your Amazon seller account and track your performance
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Business Name:</span>
                <p className="text-sm text-gray-900">{seller.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-sm text-gray-900">{seller.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Seller ID:</span>
                <p className="text-sm text-gray-900">{seller.id}</p>
              </div>
              {seller.created_at && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Member Since:</span>
                  <p className="text-sm text-gray-900">
                    {new Date(seller.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SCS Score Card */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {seller.scs_score ? seller.scs_score.toFixed(2) : "N/A"}
                </div>
                <p className="text-sm text-gray-500 mt-1">SCS Score</p>
                {seller.last_scs_update && (
                  <p className="text-xs text-gray-400 mt-2">
                    Last updated: {new Date(seller.last_scs_update).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" variant="outline">
                Add Product
              </Button>
              <Button className="w-full" variant="outline">
                Manage Inventory
              </Button>
              <Button className="w-full" variant="outline">
                View Orders
              </Button>
              <Button className="w-full" variant="outline">
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Dashboard Content */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                No recent activity to display. Start by adding your first product!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}