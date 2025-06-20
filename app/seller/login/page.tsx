"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { useSellerAuth } from "@/context/seller-auth-context";
import { useState } from "react";

export default function SellerLogin() {
  const auth = useSellerAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await auth.login(email, username);
      window.location.href = "/seller/dashboard";
    } catch (error) {
      console.error("Seller login failed", error);
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Amazon Logo */}
      <Link
        href="/"
        className="mb-8 text-3xl font-bold text-gray-900 tracking-tight"
      >
        amazon for Sellers
      </Link>

      {/* Login Card */}
      <Card className="w-full max-w-sm border border-gray-300 shadow-sm">
        <CardHeader className="pb-4">
          <h1 className="text-2xl font-normal text-gray-900">Seller Sign in</h1>
          <p className="text-sm text-gray-600">Access your seller dashboard</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-300 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-bold text-gray-900"
              >
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-8 border-gray-400 focus:border-orange-400 focus:ring-orange-400 focus:ring-1"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-bold text-gray-900"
              >
                Business Name (Optional)
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-8 border-gray-400 focus:border-orange-400 focus:ring-orange-400 focus:ring-1"
                placeholder="Leave blank to use email prefix"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-8 bg-gradient-to-b from-yellow-200 to-yellow-400 hover:from-yellow-300 hover:to-yellow-500 text-black border border-yellow-600 shadow-sm font-normal disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Continue to Seller Dashboard"}
            </Button>
          </form>

          <div className="text-xs text-gray-600 leading-4">
            By continuing, you agree to Amazon&#39;s{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-orange-600 hover:underline"
            >
              Seller Agreement
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-orange-600 hover:underline"
            >
              Privacy Notice
            </a>
            .
          </div>

          <div className="pt-4 border-t border-gray-300">
            <div className="text-xs text-gray-600 mb-2">
              <span className="font-bold">New seller?</span>
            </div>
            <Link href="/seller/signup">
              <Button
                variant="outline"
                className="w-full h-8 border-gray-400 font-normal mb-2"
              >
                Start selling on Amazon
              </Button>
            </Link>
            <div className="text-center">
              <Link 
                href="/login" 
                className="text-xs text-blue-600 hover:text-orange-600 hover:underline"
              >
                Sign in as a customer instead
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-blue-600 mb-4">
          <a href="#" className="hover:text-orange-600 hover:underline">
            Seller Agreement
          </a>
          <a href="#" className="hover:text-orange-600 hover:underline">
            Privacy Notice
          </a>
          <a href="#" className="hover:text-orange-600 hover:underline">
            Help
          </a>
        </div>
        <div className="text-xs text-gray-600">
          © 1996-2024, Amazon.com, Inc. or its affiliates
        </div>
      </div>
    </div>
  );
}