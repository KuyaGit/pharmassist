import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookie";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { TimeRange } from "@/types/analytics";
import { toast } from "sonner";

interface Analytics {
  total_revenue: number;
  total_sales: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  active_branches: number;
  branch_performance: Array<{
    branch_id: number;
    branch_name: string;
    total_sales: number;
    revenue: number;
    total_expenses: number;
    profit: number;
  }>;
  top_products: Array<{
    id: number;
    name: string;
    total_sales: number;
    revenue: number;
    profit_margin: number;
  }>;
  revenue_trend: Array<{
    timestamp: string;
    value: number;
    profit: number;
    expenses: number;
  }>;
  inventory: {
    total_branches: number;
    low_stock_branches: number;
    near_expiry_branches: number;
  };
}

export function useCompanyAnalytics(
  timeRange: TimeRange,
  branchType: "retail" | "wholesale"
) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getCookie("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.ANALYTICS.OVERVIEW}?time_range=${timeRange}&branch_type=${branchType}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
            mode: "cors",
          }
        );

        if (!response.ok) throw new Error("Failed to fetch analytics data");
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [timeRange, branchType]);

  return {
    analytics,
    isLoading,
    error,
  };
}
