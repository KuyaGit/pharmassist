interface Batch {
  quantity: number;
  expiration_date: string;
  batch_type: string;
}

interface Product {
  id: number;
  name: string;
}

interface InventoryItem {
  id: number;
  product_id: number;
  product: Product;
  beginning: number;
  offtake: number;
  selling_area: number;
  current_cost: number;
  current_srp: number;
  batches: Batch[];
  product_name: string;
  deliver: number;
  transfer: number;
  pull_out: number;
  peso_value: number;
}

interface Branch {
  id: number;
  branch_name: string;
  location: string;
  branch_type: string;
  is_active: boolean;
}

export interface InventoryReport {
  id: number;
  branch_id: number;
  created_at: string;
  start_date: string;
  end_date: string;
  items: InventoryItem[];
  branch: Branch;
  viewed_by: number[];
  items_count: number;
  branch_name: string;
  isUnviewed?: boolean;
  total_offtake_value: number;
}
