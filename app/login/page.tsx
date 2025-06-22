"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import AmazonLogo from "@/components/layout/amazon-logo";

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      // The auth.login function will update the context and throw an error on failure.
      // On success, we can navigate.
      await auth.login(email);

      // Get the intended destination from session storage, or default to home.
      const redirectPath = sessionStorage.getItem("redirect_path") || "/";
      sessionStorage.removeItem("redirect_path");

      router.push(redirectPath);
    } catch (err) {
      console.error("Login failed", err);
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-8 p-4">
      <Link href="/" className="mb-4">
        <AmazonLogo className="w-32 h-auto" color="#000" />
      </Link>

      <Card className="w-full max-w-sm border border-gray-300 shadow-none">
        <CardHeader className="pb-2">
          <h1 className="text-3xl font-normal text-gray-900">Sign in</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email or mobile phone number
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

            <Button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-9 bg-[#FFD814] hover:bg-[#F7CA00] border-[#FCD200] border text-black shadow-sm font-normal disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Continue"}
            </Button>
          </form>

          <div className="text-xs text-gray-800 leading-relaxed pt-4">
            By continuing, you agree to Amazon&apos;s{" "}
            <a
              href="#"
              className="text-blue-600 hover:text-orange-600 hover:underline"
            >
              Conditions of Use
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

      <div className="w-full max-w-sm mt-4 text-center">
        <Link
          href="/seller/login"
          className="text-sm text-blue-600 hover:text-orange-600 hover:underline"
        >
          Sign in as a seller instead
        </Link>
      </div>

      <footer className="w-full border-t mt-8 pt-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-blue-600 mb-2">
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
          <div className="text-xs text-gray-500">
            © 1996-2025, Amazon.com, Inc. or its affiliates
          </div>
        </div>
      </footer>
    </div>
  );
}
