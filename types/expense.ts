export enum ExpenseType {
  UTILITIES = "utilities",
  RENT = "rent",
  SALARIES = "salaries",
  INVENTORY = "inventory",
  MARKETING = "marketing",
  OTHER = "other",
}

export enum ExpenseScope {
  BRANCH = "branch",
  COMPANY = "company",
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
