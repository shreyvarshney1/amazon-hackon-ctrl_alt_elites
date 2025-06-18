// import Image from "next/image";

// export default function Home() {
//   return (
//     <div>
//       <h1>Welcome to Our Website!</h1>
//       <p>Explore the site using the links below:</p>
//       <ul>
//         <li><a href="/about">About Us</a></li>
//        <li><a href="/contact">Contact</a></li>
//        <li><a href="/services">Our Services</a></li>
//      </ul>
//    </div>
//   );
// }

"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { useState } from "react"

export default function Home() {

  const [inputValue, setInputValue] = useState("")
  const [inputError, setInputError] = useState("")

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Phone number validation regex (supports various formats)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{10,}$/

  const validateInput = (value: string) => {
    if (!value.trim()) {
      return "Please enter your email or phone number"
    }
    
    // Check if it's a valid email or phone number
    const isValidEmail = emailRegex.test(value)
    const isValidPhone = phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))
    
    if (!isValidEmail && !isValidPhone) {
      return "Please enter a valid email address or phone number"
    }
    
    return ""
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    
    // Clear error when user starts typing
    if (inputError) {
      setInputError("")
    }
  }

  const handleSubmit = () => {
    const error = validateInput(inputValue)
    
    if (error) {
      setInputError(error)
      return
    }
    
    // Process the form submission
    console.log("Valid input:", inputValue)
    alert(`Successfully validated: ${inputValue}`)
    // Add your submission logic here
  }

  const getInputType = () => {
    // Dynamically set input type based on content
    if (inputValue.includes('@')) {
      return 'email'
    } else if (/^\d/.test(inputValue)) {
      return 'tel'
    }
    return 'text'
  }

  const handleKeyPress = (e: { key: string }) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }
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
                type={getInputType()}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className={`h-8 border-gray-400 focus:border-orange-400 focus:ring-orange-400 focus:ring-1 ${
                  inputError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
                placeholder="Enter your email or phone number"
                autoComplete="username"
              />
              {inputError && (
                <p className="text-xs text-red-600 mt-1">{inputError}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-8 bg-gradient-to-b from-yellow-200 to-yellow-400 hover:from-yellow-300 hover:to-yellow-500 text-black border border-yellow-600 shadow-sm font-normal"
            >
              Continue
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
        <div className="text-xs text-gray-600">© 1996-2024, Amazon.com, Inc. or its affiliates</div>
      </div>
    </div>
  )
}
