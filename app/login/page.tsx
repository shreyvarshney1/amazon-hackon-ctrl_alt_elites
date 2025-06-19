"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "../auth-context";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email);
      
      // Check for redirect URL
      const redirectUrl = localStorage.getItem('redirect_after_login') || '/products';
      localStorage.removeItem('redirect_after_login');
      
      router.push(redirectUrl);
    } catch (err) {
      setError(err);
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
        amazon
      </Link>

      {/* Login Card */}
      <Card className="w-full max-w-sm border border-gray-300 shadow-sm">
        <CardHeader className="pb-4">
          <h1 className="text-2xl font-normal text-gray-900">Sign in</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-gray-900">
                Email or mobile phone number
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-8 bg-gradient-to-b from-yellow-200 to-yellow-400 hover:from-yellow-300 hover:to-yellow-500 text-black border border-yellow-600 shadow-sm font-normal"
            >
              {isLoading ? "Signing in..." : "Continue"}
            </Button>
          </form>

          <div className="text-xs text-gray-600 leading-4">
            By continuing, you agree to Amazon&#39;s{" "}
            <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
              Conditions of Use
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:text-orange-600 hover:underline">
              Privacy Notice
            </a>
            .
          </div>

          <div className="pt-4 border-t border-gray-300">
            <div className="text-xs text-gray-600 mb-2">
              <span className="font-bold">New to Amazon?</span>
            </div>
            <Link href="/signup">
              <Button variant="outline" className="w-full h-8 border-gray-400 font-normal">
                Create your Amazon account
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center space-x-4 text-xs text-blue-600 mb-4">
          <a href="#" className="hover:text-orange-600 hover:underline">
            Conditions of Use
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