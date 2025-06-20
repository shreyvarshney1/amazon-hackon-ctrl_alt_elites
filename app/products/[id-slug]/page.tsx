"use client";

import ProductDetails from "./product-details";
import { use, useEffect, useState } from "react";
import { getProductById } from "@/lib/api/product";
import { Product } from "@/types/product";

interface ProductPageProps {
  params: Promise<{ "id-slug": string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams["id-slug"].split("-")[0];
  const [product, setProduct] = useState<Product>();

  useEffect(() => {
    getProductById(id)
      .then((product) => setProduct(product))
      .catch((error) =>
        console.error("Failed to fetch product." + error.message),
      );
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      {/* <div className="px-4 py-2 text-sm text-[#565959]">
        <span className="hover:text-[#ff9900] cursor-pointer">Bags, Wallets and Luggage</span>
        <span className="mx-2">›</span>
        <span className="hover:text-[#ff9900] cursor-pointer">Travel Accessories</span>
        <span className="mx-2">›</span>
        <span className="hover:text-[#ff9900] cursor-pointer">Umbrellas</span>
        <span className="mx-2">›</span>
        <span className="hover:text-[#ff9900] cursor-pointer">Folding Umbrellas</span>
      </div> */}

      {product ? (
        <ProductDetails product={product} />
      ) : (
        <div className="p-8 text-center text-red-600">Product not found.</div>
      )}
    </div>
  );
}
