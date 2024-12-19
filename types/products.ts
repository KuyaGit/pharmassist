export interface Product {
  id: number;
  name: string;
  cost: number;
  srp: number;
  retail_low_stock_threshold: number;
  wholesale_low_stock_threshold: number;
  is_retail_available: boolean;
  is_wholesale_available: boolean;
  image_url?: string | null;
}
