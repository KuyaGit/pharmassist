import { ReactNode } from "react";

export interface Branch {
  name: ReactNode;
  id: number;
  branch_name: string;
  location: string;
  is_active: boolean;
  branch_type: "retail" | "wholesale";
  has_low_stock: boolean;
  has_near_expiry: boolean;
}

export interface BranchInventory {
  id: number;
  product_name: string;
  stock_level: number;
  expiry_date: string;
  branch_name: string;
}

export interface BranchReport {
  id: number;
  date_created: string;
  status: "pending" | "approved" | "rejected";
  branch_id: number;
}

export interface SalesData {
  month: string;
  sales: number;
  profit: number;
}

export interface CategorySales {
  name: string;
  value: number;
}

export interface TopProduct {
  name: string;
  value: number;
  quantity: number;
}

export interface BranchReportWithOfftakes extends BranchReport {
  offtakes?: Array<{
    product_id: number;
    product_name: string;
    quantity: number;
    srp: number;
    cost: number;
  }>;
  type?: string;
  created_at: string;
  total_offtake_value: number;
}
