"use client";

import { useEffect, useState } from "react";
import ProductCard from "./product-card";
import { getProducts } from "@/lib/api/product";
import { Product } from "@/types/product";
import Loader from "@/components/loader";
import SearchSidebar from "./search-sidebar";

export default function AmazonSearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    getProducts()
      .then((products) => {
        setProducts(products);
      })
      .catch((error) => {
        console.error("Failed to fetch all products. " + error.message);
        setError("Could not load products. Please try refreshing the page.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="flex">
        <SearchSidebar />

        <div className="flex-1 p-4">
          {isLoading ? (
            <Loader text="Loading products..." />
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
