"use client";
import { useState, useCallback, useEffect } from "react";
import { useSellerAuth } from "@/context/seller-auth-context";
import { getSellerProducts, deleteProduct } from "@/lib/api/seller";
import { Product } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Plus } from "lucide-react";
import Loader from "@/components/loader";
import ProductForm from "./product-form";

interface ProductsTabProps {
  isReady: boolean;
}

export default function ProductsTab({ isReady }: ProductsTabProps) {
  const { seller, token, refreshSeller } = useSellerAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!token || !seller || seller.id === "guest") {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sellerProducts = await getSellerProducts(token);
      setProducts(sellerProducts);
    } catch (err) {
      console.error("Failed to fetch seller products:", err);
      setError(err instanceof Error ? err.message : "Failed to load products.");
    } finally {
      setIsLoading(false);
    }
  }, [token, seller]);

  useEffect(() => {
    if (isReady) {
      fetchProducts();
    }
  }, [isReady, fetchProducts]);

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!token || !confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await deleteProduct(token, Number(productId));
      await fetchProducts();
      refreshSeller();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete product",
      );
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    fetchProducts();
    refreshSeller();
  };

  const renderContent = () => {
    if (isLoading) {
      return <Loader text="Loading your products..." />;
    }
    if (error) {
      return (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <Button onClick={fetchProducts} variant="outline" className="mt-4">
            Try Again
          </Button>
        </div>
      );
    }
    if (products.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          You have no products listed. Add your first product to get started!
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 bg-white flex justify-between items-start gap-4"
          >
            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              <div className="col-span-1 md:col-span-3 space-y-1">
                <span className="text-sm font-medium text-gray-500">
                  Product Name
                </span>
                <p className="font-semibold text-gray-900">{product.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Price</span>
                <p className="text-gray-800">₹{product.price.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Category
                </span>
                <p className="text-gray-800">{product.category}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  PIS Score
                </span>
                <p className="text-lg font-bold text-blue-600">
                  {product.pis_score.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button
                onClick={() => handleEditClick(product)}
                variant="outline"
                size="icon"
                aria-label="Edit Product"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleDelete(product.id)}
                variant="destructive"
                size="icon"
                aria-label="Delete Product"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>My Products</CardTitle>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleFormSuccess}
        />
      )}
    </>
  );
}
