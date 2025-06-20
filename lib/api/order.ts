interface OrderDetails {
  message: string;
  order_id: string;
}

export async function placeOrder(
  productId: string,
  quantity: number,
): Promise<OrderDetails> {
  const token = localStorage.getItem("auth_token");

  if (!token) {
    throw new Error("Failed to retrieve token!");
  }

  const response = await fetch("/api/orders/add-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [
        {
          product_id: productId,
          quantity: quantity,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to place order!");
  }

  const OrderDetails = await response.json();

  return OrderDetails;
}
