import { Order } from "@/types/order";
import { Product, ProductFormData } from "@/types/product";
import {
  Seller,
  SellerLoginCredentials,
  SellerLoginResponse,
} from "@/types/seller";

// --- Authentication Actions ---

/**
 * Logs in a seller by sending their credentials to the backend.
 * @param credentials The seller's email and optional username.
 * @returns A promise that resolves to the login response, including the JWT token.
 */
export const loginSeller = async (
  credentials: SellerLoginCredentials,
): Promise<SellerLoginResponse> => {
  const response = await fetch(`/api/seller/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || "Seller login failed");
  }
  return response.json();
};

/**
 * Fetches the current seller's session data from the backend.
 * @param token The seller's JWT token.
 * @returns A promise that resolves to the full seller object.
 */
export const getSellerSession = async (token: string): Promise<Seller> => {
  const response = await fetch(`/api/seller/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to fetch seller session");
  }
  return response.json();
};

// --- Product Actions ---

export const getSellerProducts = async (
  token: string,
  sellerId: string,
): Promise<Product[]> => {
  const response = await fetch(`/api/products/all`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = await response.json();
  if (!data.products || !Array.isArray(data.products)) {
    throw new Error("Invalid product data format from API");
  }

  return data.products.filter(
    (product: Product) => String(product.seller.id) === String(sellerId),
  );
};

export const addProduct = async (
  token: string,
  productData: ProductFormData,
): Promise<Product> => {
  const response = await fetch(`/api/products/add-product`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error("Failed to add product");
  return response.json();
};

export const updateProduct = async (
  token: string,
  productId: number,
  productData: ProductFormData,
): Promise<Product> => {
  const response = await fetch(`/api/products/${productId}/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) throw new Error("Failed to update product");
  return response.json();
};

export const deleteProduct = async (
  token: string,
  productId: number,
): Promise<Product> => {
  const response = await fetch(`/api/products/${productId}/delete`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to delete product");
  return response.json();
};

// --- Order Actions ---

export const getSellerOrders = async (token: string): Promise<Order[]> => {
  const response = await fetch(`/api/orders/seller/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch seller orders");
  const data = await response.json();
  return data.orders || [];
};

const handleSellerOrderAction = async (
  token: string,
  url: string,
  body: object,
) => {
  const response = await fetch(`/api${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Order action failed");
  }
  return response.json();
};

export const deliverOrderItem = (
  token: string,
  orderId: number,
  productId: number,
  delivered_on_time: boolean,
) =>
  handleSellerOrderAction(token, "/orders/seller/orders/deliver-product", {
    order_id: orderId,
    product_id: productId,
    delivered_on_time,
  });

export const cancelSellerOrderItem = (
  token: string,
  orderId: number,
  productId: number,
) =>
  handleSellerOrderAction(token, "/orders/seller/orders/cancel-product", {
    order_id: orderId,
    product_id: productId,
  });

export const processRefund = (
  token: string,
  orderId: number,
  productId: number,
) =>
  handleSellerOrderAction(token, "/orders/seller/orders/refund-process", {
    order_id: orderId,
    product_id: productId,
  });

export const rejectRefund = (
  token: string,
  orderId: number,
  productId: number,
) =>
  handleSellerOrderAction(token, "/orders/seller/orders/refund-reject", {
    order_id: orderId,
    product_id: productId,
  });
