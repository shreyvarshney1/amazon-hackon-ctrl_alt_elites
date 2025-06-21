"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { useSellerAuth } from "@/context/seller-auth-context";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import AmazonLogo from "@/components/layout/amazon-logo";
import { useRouter } from "next/navigation";

export default function SellerLogin() {
  const auth = useSellerAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Await the login function. It will throw an error on failure.
      // On success, it will update the context and return the seller data.
      const loggedInSeller = await auth.login(email, username);

      // Double-check that we got a valid seller before navigating.
      if (loggedInSeller && loggedInSeller.id !== "guest") {
        // Now we can confidently navigate.
        router.push("/seller/dashboard");
      } else {
        // This case should ideally not happen if login throws an error, but it's good for safety.
        throw new Error("Login succeeded but no seller data was returned.");
      }
    } catch (error) {
      console.error("Seller login failed", error);
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 pt-8">
      <Link href="/" className="mb-4">
        <AmazonLogo className="w-40 h-auto" color="#000" />
      </Link>

      <Card className="w-full max-w-sm border border-gray-300 shadow-sm">
        <CardHeader className="pb-4">
          <h1 className="text-2xl font-normal text-gray-900">
            Sign in for Sellers
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-bold">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 border-gray-400 focus:border-orange-500 focus:ring-orange-500 focus:ring-1"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-bold">
                Business Name (Optional)
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-9 border-gray-400 focus:border-orange-500 focus:ring-orange-500 focus:ring-1"
                placeholder="Leave blank to use email prefix"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-9 bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200] border text-black shadow-sm font-normal disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>
          </form>

          <div className="text-xs text-gray-600 leading-relaxed pt-4">
            By continuing, you agree to Amazon&apos;s{" "}
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
        </CardContent>
      </Card>
      <div className="relative w-full max-w-sm my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500">New to Amazon?</span>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        className="w-full max-w-sm h-9 border-gray-300 shadow-sm font-normal"
      >
        <Link href="/signup">Create your Amazon account</Link>
      </Button>
      <div className="w-full max-w-sm mt-6">
        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-blue-600 hover:text-orange-600 hover:underline"
          >
            Sign in as a customer instead
          </Link>
        </div>
      </div>
      <footer className="w-full border-t mt-8 pt-6">
        <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-6 text-xs text-blue-600 mb-2">
                <a href="#" className="hover:text-orange-600 hover:underline">Conditions of Use</a>
                <a href="#" className="hover:text-orange-600 hover:underline">Privacy Notice</a>
                <a href="#" className="hover:text-orange-600 hover:underline">Help</a>
            </div>
            <div className="text-xs text-gray-500">
                © 1996-2025, Amazon.com, Inc. or its affiliates
            </div>
        </div>
      </footer>
    </div>
  );
}
