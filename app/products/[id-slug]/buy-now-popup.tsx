"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus, Minus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from 'next/image'

interface BuyNowPopupProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    price: number
    image: string
  }
  onPlaceOrder: (quantity: number) => void
}

export default function BuyNowPopup({ isOpen, onClose, product, onPlaceOrder }: BuyNowPopupProps) {
  const [quantity, setQuantity] = useState(1)
  const [isOrderPlaced, setIsOrderPlaced] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset states when popup opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setIsOrderPlaced(false)
      setShowSuccess(false)
    }
  }, [isOpen])

  // Handle quantity changes
  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, 10)) // Max 10 items
  }

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1)) // Min 1 item
  }

  // Handle place order
  const handlePlaceOrder = () => {
    setIsOrderPlaced(true)
    setShowSuccess(true)

    // Call the parent's place order function
    onPlaceOrder(quantity)

    // Show success animation for 2 seconds then close
    setTimeout(() => {
      setShowSuccess(false)
      setIsOrderPlaced(false)
      onClose()
    }, 2000)
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Success Animation Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-20 rounded-lg">
            <div className="relative">
              {/* Animated Check Circle */}
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <Check className="w-10 h-10 text-white animate-bounce" />
              </div>

              {/* Success Ring Animation */}
              <div className="absolute inset-0 border-4 border-green-500 rounded-full animate-ping opacity-75"></div>
            </div>

            <div className="mt-6 text-center">
              <h3 className="text-xl font-bold text-green-600 mb-2">Order Placed Successfully!</h3>
              <p className="text-gray-600">Thank you for your purchase</p>
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                <span className="ml-2 text-sm text-gray-500">Redirecting...</span>
              </div>
            </div>
          </div>    
        )}

        {/* Popup Content */}
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Purchase</h2>
            <p className="text-gray-600">Review your order details below</p>
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex gap-4">
              {/* Product Image */}
              <div className="w-24 h-24 bg-white rounded border flex items-center justify-center flex-shrink-0">
                <Image
                  src={product.image || "/placeholder.svg?height=80&width=80"}
                  alt={product.name || "Product image"}
                  className="w-16 h-16 object-contain"
                  width={100}
                  height={100}
                />
              </div>

              {/* Product Details */}
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#b12704]">₹{product.price}</span>
                  <span className="text-sm text-gray-500">per item</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1 || isOrderPlaced}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>

                <div className="px-4 py-2 min-w-[60px] text-center font-medium border-x border-gray-300">
                  {quantity}
                </div>

                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= 10 || isOrderPlaced}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <span className="text-sm text-gray-500">(Max 10 items)</span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Order Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  Subtotal ({quantity} {quantity === 1 ? "item" : "items"})
                </span>
                <span>₹{(product.price * quantity).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-[#b12704]">₹{(product.price * quantity).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={isOrderPlaced}
            className="w-full bg-[#ff9900] hover:bg-[#f0a742] text-black font-bold py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isOrderPlaced ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Processing...
              </div>
            ) : (
              `Place Order - ₹${(product.price * quantity).toLocaleString()}`
            )}
          </Button>

          {/* Additional Info */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              By placing this order, you agree to Amazon&apos;s{" "}
              <span className="text-[#0052b4] underline cursor-pointer">Terms & Conditions</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
