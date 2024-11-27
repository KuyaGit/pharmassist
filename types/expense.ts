export enum ExpenseType {
  UTILITIES = "utilities",
  SUPPLIES = "supplies",
  MAINTENANCE = "maintenance",
  SALARY = "salary",
  RENT = "rent",
  MARKETING = "marketing",
  INVENTORY = "inventory",
  OTHERS = "others",
}

export enum ExpenseScope {
  BRANCH = "branch",
  MAIN_OFFICE = "main_office",
  COMPANY_WIDE = "company_wide",
}

interface Branch {
  id: number;
  branch_name: string;
}

export interface Expense {
  id: number;
  name: string;
  type: ExpenseType;
  amount: number;
  description: string | null;
  vendor: string | null;
  scope: ExpenseScope;
  branch_id: number | null;
  date_created: string;
  created_by_id: number;
  created_at: string;
  updated_at: string;
  branch?: Branch;
}

export interface ExpenseAnalytics {
  total_amount: number;
  daily_average: number;
  highest_category: string;
  highest_category_percentage: number;
  month_over_month_change: number;
  last_expense_date: string;
  category_distribution: Array<{
    category: string;
    amount: number;
  }>;
}

export interface ExpenseDataPoint {
  id: number;
  date: string;
  amount: number;
  type: string;
  description: string;
}
