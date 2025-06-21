import { CartItem } from "@/context/cart-context";
import { Order } from "@/types/order";

export const createOrder = async (
  cartItems: CartItem[],
  token: string
): Promise<Order> => {
  const response = await fetch("/api/orders/add-order", {
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
