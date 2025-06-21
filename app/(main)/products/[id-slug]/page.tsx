"use client";

import ProductDetails from "./product-details";
import { useEffect, useState, useCallback, use } from "react";
import { getProductById } from "@/lib/api/product";
import { Product } from "@/types/product";
import Loader from "@/components/loader";

interface ProductPageProps {
  params: Promise<{ "id-slug": string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams["id-slug"].split("-")[0];
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductData = useCallback(() => {
    getProductById(id)
      .then((productData) => {
        setProduct(productData);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch product." + err.message);
        setError("Product not found or an error occurred.");
      });
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    getProductById(id)
      .then((productData) => setProduct(productData))
      .catch((err) => {
        console.error("Failed to fetch product." + err.message);
        setError("Product not found or an error occurred.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="p-8">
        <Loader text="Loading product details..." />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 text-center text-red-600">
        {error || "Product not found."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProductDetails
        key={product.last_pis_update || product.id}
        product={product}
        onProductUpdate={fetchProductData}
      />
    </div>
  );
}
