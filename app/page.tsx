import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Card, CardContent, CardHeader } from "./components/ui/card"
import Link from "next/link"

export default function AmazonLoginPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Amazon Logo */}
      <div className="mb-8">
        <div className="text-3xl font-bold text-gray-900 tracking-tight">amazon</div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-sm border border-gray-300 shadow-sm">
        <CardHeader className="pb-4">
          <h1 className="text-2xl font-normal text-gray-900">Sign in</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-gray-900">
                Email or mobile phone number
              </Label>
              <Input
                id="email"
                type="email"
                className="h-8 border-gray-400 focus:border-orange-400 focus:ring-orange-400 focus:ring-1"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-8 bg-gradient-to-b from-yellow-200 to-yellow-400 hover:from-yellow-300 hover:to-yellow-500 text-black border border-yellow-600 shadow-sm font-normal"
            >
              Continue
            </Button>
          </form>

          <div className="text-xs text-gray-600 leading-4">
            By continuing, you agree to Amazon's{" "}
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
            <Link href="./signup">
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
        <div className="text-xs text-gray-600">© 1996-2024, Amazon.com, Inc. or its affiliates</div>
      </div>
    </div>
  )
}
