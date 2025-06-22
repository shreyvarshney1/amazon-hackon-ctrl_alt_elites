// lib/api/order.ts

import { CartItem } from "@/context/cart-context";
import { Order } from "@/types/order";

/**
 * Fetches all orders for the currently authenticated user.
 * @param token The user's JWT token.
 * @returns A promise that resolves to an array of orders.
 */
export const getMyOrders = async (token: string): Promise<Order[]> => {
  const response = await fetch(`/api/orders/my-orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch orders");
  }

  const data = await response.json();
  return data.orders;
};

/**
 * Creates a new order from the items in the cart.
 * @param cartItems The items to include in the order.
 * @param token The user's JWT token.
 * @returns A promise that resolves to the newly created order data.
 */
export const createOrder = async (
  cartItems: CartItem[],
  token: string,
): Promise<{ message: string; order_id: number }> => {
  const response = await fetch(`api/orders/add-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create order");
  }

  return response.json();
};

/**
 * Cancels a specific item within an order.
 * @param token The user's JWT token.
 * @param orderId The ID of the order containing the item.
 * @param productId The ID of the product to cancel.
 * @returns A promise that resolves on successful cancellation.
 */
export const cancelOrderItem = async (
  token: string,
  orderId: number,
  productId: number,
): Promise<{ message: string }> => {
  const response = await fetch(`api/orders/cancel-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      order_id: orderId,
      product_id: productId,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to cancel order item");
  }

  return response.json();
};

interface ReturnPayload {
  order_id: number;
  product_id: number;
  reason: string;
  reason_category?:
    | "counterfeit"
    | "fake"
    | "not_as_described"
    | "damaged"
    | "other";
}

/**
 * Initiates a return for a specific item in an order.
 * @param token The user's JWT token.
 * @param payload The details for the return request.
 * @returns A promise that resolves on successful return initiation.
 */
export const returnOrderItem = async (
  token: string,
  payload: ReturnPayload,
): Promise<{ message: string }> => {
  // Simple logic to categorize the return reason for the backend
  const reasonLower = payload.reason.toLowerCase();
  if (reasonLower.includes("fake") || reasonLower.includes("counterfeit")) {
    payload.reason_category = "fake";
  } else if (
    reasonLower.includes("described") ||
    reasonLower.includes("different")
  ) {
    payload.reason_category = "not_as_described";
  }

  const response = await fetch(`api/orders/return-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to return order item");
  }

  return response.json();
};
