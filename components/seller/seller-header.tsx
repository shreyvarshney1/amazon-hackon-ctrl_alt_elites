// components/seller/seller-header.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSellerAuth } from "@/context/seller-auth-context";
import { Seller } from "@/types/seller";
import { ScoreTooltip } from "../score-tooltip";

interface SellerHeaderProps {
  seller: Seller;
}

export default function SellerHeader({ seller }: SellerHeaderProps) {
  const { logout } = useSellerAuth();

  return (
    <>
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
              <Button onClick={logout} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Seller Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Business Name
                </span>
                <p className="text-lg font-semibold text-gray-900">
                  {seller.name}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-lg text-gray-900">{seller.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Seller Credibility Score
                </span>
                <ScoreTooltip scoreType="SCS" scoreValue={seller.scs_score}>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-green-600">
                      {seller.scs_score ? seller.scs_score.toFixed(2) : "N/A"}
                    </p>
                    <div className="text-xs text-gray-400">
                      {seller.last_scs_update && (
                        <p>
                          Updated:{" "}
                          {new Date(
                            seller.last_scs_update
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </ScoreTooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
