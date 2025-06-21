export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_description: string;
  product_category: string;
  product_seller: string;
  quantity: number;
  price_at_purchase: number;
  status: string;
}

export interface Order {
  id: number;
  username: string;
  created_at: string;
  status: string;
  shipped_on_time: boolean;
  items: OrderItem[];
  total_amount: number;
}
