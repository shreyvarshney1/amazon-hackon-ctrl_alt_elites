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

export default function SignupPage() {
  const auth = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Included for UI, though not sent to backend
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || password.length < 6) {
      setError(
        "Please fill all fields correctly. Password must be at least 6 characters.",
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Our backend's login endpoint doubles as a signup endpoint
      await auth.login(email, name);
      // After successful login/signup, redirect to the homepage
      router.push("/");
    } catch (err) {
      console.error("Signup failed", err);
      setError(
        err instanceof Error ? err.message : "Signup failed. Please try again.",
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
          <h1 className="text-3xl font-normal text-gray-900">Create account</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="name" className="text-sm font-medium">
                Your name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First and last name"
                className="h-9"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="h-9"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-blue-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Passwords must be at least 6 characters.
              </p>
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
            By creating an account, you agree to Amazon&apos;s{" "}
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

          <div className="pt-4 border-t border-gray-200 text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-orange-600 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
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
