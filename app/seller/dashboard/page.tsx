"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSellerAuth } from "@/context/seller-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Edit,
  Plus,
  X,
  PackageCheck,
  Ban,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Product } from "@/types/product";

// --- TYPE DEFINITIONS ---

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image_urls: string;
}

// Add new types for Orders
interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  status: "pending" | "delivered" | "cancelled" | "returned" | "refunded";
  delivered_on_time: boolean | null;
}

interface Order {
  id: number;
  username: string;
  created_at: string;
  items: OrderItem[];
}

function getSlug(productName: string) {
  return productName.toLocaleLowerCase().replace(/\s+/g, "-");
}

// --- ORDERS TAB COMPONENT ---

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // State to manage the on-time checkbox for each order item
  const [onTimeDeliveryStatus, setOnTimeDeliveryStatus] = useState<
    Record<string, boolean>
  >({});

  const fetchOrders = async () => {
    setLoadingOrders(true);
    setError(null);
    try {
      // ASSUMPTION: You need to create an endpoint like `/api/orders/seller`
      // that fetches all orders for the currently authenticated seller.
      const response = await fetch("/api/orders/seller/orders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("seller_auth_token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch orders.");
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOnTimeToggle = (orderItemId: number, checked: boolean) => {
    setOnTimeDeliveryStatus((prev) => ({ ...prev, [orderItemId]: checked }));
  };
  const handleAction = async (
    url: string,
    body: Record<string, string | number | boolean>,
    successMessage: string,
  ) => {
    try {
      const token = localStorage.getItem("seller_auth_token");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Action failed");
      }
      alert(successMessage);
      fetchOrders(); // Refresh the list after action
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleDeliver = (
    orderId: number,
    productId: number,
    orderItemId: number,
  ) => {
    const delivered_on_time = onTimeDeliveryStatus[orderItemId] ?? false;
    handleAction(
      "/api/orders/seller/orders/deliver-product",
      { order_id: orderId, product_id: productId, delivered_on_time },
      "Product marked as delivered!",
    );
  };

  const handleCancel = (orderId: number, productId: number) => {
    if (
      !confirm(
        "Are you sure you want to cancel this item? This cannot be undone.",
      )
    )
      return;
    handleAction(
      "/api/orders/seller/orders/cancel-product",
      { order_id: orderId, product_id: productId },
      "Order item has been cancelled.",
    );
  };

  const handleAcceptRefund = (orderId: number, productId: number) => {
    if (
      !confirm(
        "Are you sure you want to accept the refund request? This will process the refund.",
      )
    )
      return;
    handleAction(
      "/api/orders/seller/orders/refund-process",
      { order_id: orderId, product_id: productId },
      "Refund has been processed successfully.",
    );
  };
  const handleRejectRefund = (_orderId: number, _productId: number) => {
    // This is a placeholder to test refund-rejection functionality.
    console.log("Rejecting refund for order:", _orderId, "product:", _productId);
    alert(
      "Reject refund functionality is not yet connected to an API endpoint.",
    );
  };

  const StatusBadge = ({ status }: { status: OrderItem["status"] }) => {
    const statusStyles: Record<OrderItem["status"], string> = {
      pending: "bg-yellow-100 text-yellow-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      returned: "bg-blue-100 text-blue-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loadingOrders) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You have no orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="bg-white">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                <p className="text-sm text-gray-500">
                  Placed by: {order.username} on{" "}
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="border-t pt-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ₹{item.price_at_purchase.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <StatusBadge status={item.status} />

                    {/* --- Conditional Action Buttons --- */}
                    <div className="flex items-center space-x-2 mt-2">
                      {item.status === "pending" && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`on-time-${item.id}`}
                              onCheckedChange={(checked) =>
                                handleOnTimeToggle(item.id, !!checked)
                              }
                            />
                            <Label
                              htmlFor={`on-time-${item.id}`}
                              className="text-sm text-gray-600"
                            >
                              On-time
                            </Label>
                          </div>
                          <Button
                            size="sm"
                            onClick={() =>
                              handleDeliver(order.id, item.product_id, item.id)
                            }
                          >
                            <PackageCheck className="h-4 w-4 mr-2" /> Deliver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() =>
                              handleCancel(order.id, item.product_id)
                            }
                          >
                            <Ban className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                        </>
                      )}
                      {(item.status === "returned" ||
                        item.status === "cancelled") && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              handleAcceptRefund(order.id, item.product_id)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Accept
                            Refund
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleRejectRefund(order.id, item.product_id)
                            }
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Reject Refund
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// --- MAIN DASHBOARD COMPONENT ---

export default function SellerDashboard() {
  const { seller, isLoading, logout } = useSellerAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    image_urls: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  // New state for active tab
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");

  useEffect(() => {
    if (!isLoading && (!seller || seller.id === "guest")) {
      router.push("/seller/login");
    }
  }, [seller, isLoading, router]);
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/products/all");
      if (response.ok) {
        const data = await response.json();
        const sellerProducts = data.products.filter(
          (product: Product) => product.seller.id === seller?.id,
        );
        setProducts(sellerProducts);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
    }
  }, [seller?.id]);
  useEffect(() => {
    if (seller && seller.id !== "guest") {
      fetchProducts();
    }
  }, [seller, fetchProducts]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      image_urls: "",
    });
    setEditingProduct(null);
    setShowProductForm(false);
    setError("");
  };

  const handleAddProduct = () => {
    resetForm();
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image_urls: product.image_urls.join(", "),
    });
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("seller_auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const requestData = {
        name: formData.name,
        slug: getSlug(formData.name),
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        image_urls: formData.image_urls
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url),
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}/update`
        : "/api/products/add-product";

      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const token = localStorage.getItem("seller_auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/products/${productId}/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      await fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  if (!seller || seller.id === "guest") {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Amazon Seller Central
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {seller.name}
              </span>
              <Button onClick={logout} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Business Name
                  </span>
                  <p className="text-lg font-semibold text-gray-900">
                    {seller.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Email
                  </span>
                  <p className="text-lg text-gray-900">{seller.email}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Seller ID
                  </span>
                  <p className="text-lg text-gray-900">{seller.id}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Seller Credibility Score
                  </span>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-green-600">
                      {seller.scs_score ? seller.scs_score.toFixed(2) : "N/A"}
                    </p>
                    <div className="text-xs text-gray-400">
                      {seller.last_scs_update && (
                        <p>
                          Updated:{" "}
                          {new Date(
                            seller.last_scs_update,
                          ).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- TABS NAVIGATION --- */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("products")}
              className={`${
                activeTab === "products"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`${
                activeTab === "orders"
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Orders
            </button>
          </nav>
        </div>

        {/* --- CONDITIONAL TAB CONTENT --- */}
        <div>
          {activeTab === "products" && (
            <div className="mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>My Products</CardTitle>
                  <Button
                    onClick={handleAddProduct}
                    className="flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Product</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingProducts ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading products...</p>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        No products listed yet. Add your first product to get
                        started!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="border rounded-lg p-4 bg-white"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                  <span className="text-sm font-medium text-gray-500">
                                    Product Name
                                  </span>
                                  <p className="font-semibold text-gray-900">
                                    {product.name}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">
                                    Category
                                  </span>
                                  <p className="text-gray-900">
                                    {product.category}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">
                                    Price
                                  </span>
                                  <p className="text-gray-900 font-semibold">
                                    ₹{product.price}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">
                                    Product Integrity Score
                                  </span>
                                  <p className="text-lg font-bold text-blue-600">
                                    {product.pis_score
                                      ? product.pis_score.toFixed(2)
                                      : "Calculating..."}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-500">
                                    Listed
                                  </span>
                                  <p className="text-gray-900">
                                    {new Date(
                                      product.listed_at,
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2">
                                <span className="text-sm font-medium text-gray-500">
                                  Description
                                </span>
                                <p className="text-gray-900 text-sm">
                                  {product.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <Button
                                onClick={() => handleEditProduct(product)}
                                variant="outline"
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                onClick={() =>
                                  handleDeleteProduct(Number(product.id))
                                }
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "orders" && <OrdersTab />}
        </div>
      </main>

      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <Button onClick={resetForm} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-300 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    disabled={formLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_urls">Image URLs (comma-separated)</Label>
                <Textarea
                  id="image_urls"
                  name="image_urls"
                  value={formData.image_urls}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  disabled={formLoading}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  onClick={resetForm}
                  variant="outline"
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading
                    ? "Saving..."
                    : editingProduct
                      ? "Update Product"
                      : "Add Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
