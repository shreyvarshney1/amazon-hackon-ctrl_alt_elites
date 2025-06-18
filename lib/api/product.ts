import { Product } from '@/types/product';

const API_BASE_URL = 'http://vision:3000/api/products';

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`/api/products`);
  // const response = await fetch(`${API_BASE_URL}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  const data = await response.json();
  // console.log("API Response : ", data);

  return data.products;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }
  return await response.json();
}