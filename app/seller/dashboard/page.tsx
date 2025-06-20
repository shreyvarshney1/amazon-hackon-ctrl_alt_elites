// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSellerAuth } from "@/context/seller-auth-context";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// export default function SellerDashboard() {
//   const { seller, isLoading, logout } = useSellerAuth();
//   const router = useRouter();

//   useEffect(() => {
//     if (!isLoading && (!seller || seller.id === "guest")) {
//       router.push("/seller/login");
//     }
//   }, [seller, isLoading, router]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading seller dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!seller || seller.id === "guest") {
//     return null; // Will redirect to login
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16">
//             <div className="flex items-center">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Amazon Seller Central
//               </h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <span className="text-sm text-gray-600">
//                 Welcome, {seller.name}
//               </span>
//               <Button
//                 onClick={logout}
//                 variant="outline"
//                 size="sm"
//               >
//                 Sign Out
//               </Button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//         <div className="mb-8">
//           <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
//           <p className="mt-2 text-gray-600">
//             Manage your Amazon seller account and track your performance
//           </p>
//         </div>

//         {/* Dashboard Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Account Info Card */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Account Information</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-2">
//               <div>
//                 <span className="text-sm font-medium text-gray-500">Business Name:</span>
//                 <p className="text-sm text-gray-900">{seller.name}</p>
//               </div>
//               <div>
//                 <span className="text-sm font-medium text-gray-500">Email:</span>
//                 <p className="text-sm text-gray-900">{seller.email}</p>
//               </div>
//               <div>
//                 <span className="text-sm font-medium text-gray-500">Seller ID:</span>
//                 <p className="text-sm text-gray-900">{seller.id}</p>
//               </div>
//               {seller.created_at && (
//                 <div>
//                   <span className="text-sm font-medium text-gray-500">Member Since:</span>
//                   <p className="text-sm text-gray-900">
//                     {new Date(seller.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* SCS Score Card */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Seller Performance</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="text-center">
//                 <div className="text-3xl font-bold text-green-600">
//                   {seller.scs_score ? seller.scs_score.toFixed(2) : "N/A"}
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">SCS Score</p>
//                 {seller.last_scs_update && (
//                   <p className="text-xs text-gray-400 mt-2">
//                     Last updated: {new Date(seller.last_scs_update).toLocaleDateString()}
//                   </p>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           {/* Quick Actions Card */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Quick Actions</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <Button className="w-full" variant="outline">
//                 Add Product
//               </Button>
//               <Button className="w-full" variant="outline">
//                 Manage Inventory
//               </Button>
//               <Button className="w-full" variant="outline">
//                 View Orders
//               </Button>
//               <Button className="w-full" variant="outline">
//                 Account Settings
//               </Button>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Additional Dashboard Content */}
//         <div className="mt-8">
//           <Card>
//             <CardHeader>
//               <CardTitle>Recent Activity</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-gray-500 text-center py-8">
//                 No recent activity to display. Start by adding your first product!
//               </p>
//             </CardContent>
//           </Card>
//         </div>
//       </main>
//     </div>
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSellerAuth } from "@/context/seller-auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Edit, Plus, X } from "lucide-react";
import { Product } from "@/types/product";

interface ProductFormData 
 {
  name: string;
  slug: string;
  description: string;
  price: string;
  category: string;
  image_urls: string;
}

export default function SellerDashboard() {
  const { seller, isLoading, logout } = useSellerAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: "",
    category: "",
    image_urls: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && (!seller || seller.id === "guest")) {
      router.push("/seller/login");
    }
  }, [seller, isLoading, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products/all");
      if (response.ok) {
        const data = await response.json();
        // Filter products by current seller
        console.log(data.products)
        console.log(seller);
        const sellerProducts = data.products.filter(
          (product: Product) => product.seller.id === seller?.id
        );
        console.log(sellerProducts)
        setProducts(sellerProducts);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (seller && seller.id !== "guest") {
      fetchProducts();
    }
  }, [seller]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      slug: "",
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
      slug: product.slug,
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
        slug: formData.slug,
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

      // Refresh products list
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

      // Refresh products list
      await fetchProducts();
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete product"
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
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Seller Info Section */}
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
                            seller.last_scs_update
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

        {/* Products Section */}
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
                                ${product.price}
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
                                  product.listed_at
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
                            onClick={() => handleDeleteProduct(Number(product.id))}
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
      </main>

      {/* Product Form Modal */}
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
                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
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
