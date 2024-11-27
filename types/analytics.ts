export interface SalesDataPoint {
  date: string;
  product: string;
  category: string;
  quantity: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface ExpenseDataPoint {
  date: string;
  amount: number;
  type: string;
  description: string;
}

export interface ProcessedDataPoint {
  date: string;
  sales: number;
  profit: number;
  expenses: number;
  netProfit: number;
  topProducts: {
    name: string;
    value: number;
    quantity: number;
  }[];
}

export type TimeGranularity = "daily" | "weekly" | "monthly" | "yearly";
export type TimeRange = "7d" | "30d" | "90d" | "1y" | "custom";
