import { useState, useEffect, useMemo } from "react";
import { groupBy, sumBy } from "lodash";
import { getCookie } from "@/lib/cookie";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";
import {
  SalesDataPoint,
  ExpenseDataPoint,
  ProcessedDataPoint,
  TimeGranularity,
  TimeRange,
} from "@/types/analytics";

interface RawData {
  sales: SalesDataPoint[];
  expenses: ExpenseDataPoint[];
}

export function useBranchAnalytics(
  branchId: number,
  timeRange: TimeRange,
  granularity: TimeGranularity
) {
  const [rawData, setRawData] = useState<RawData>({ sales: [], expenses: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const token = getCookie("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.ANALYTICS.BRANCH}/${branchId}?time_range=${timeRange}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch analytics data");
        const data = await response.json();
        setRawData(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [branchId, timeRange]);

  const processedData = useMemo<ProcessedDataPoint[]>(() => {
    const { sales, expenses } = rawData;

    // Calculate time-range based metrics first
    const timeRangeMetrics = {
      topProducts: Object.entries(groupBy(sales, "product"))
        .map(([product, sales]) => ({
          name: product,
          value: sumBy(sales, "revenue"),
          quantity: sumBy(sales, "quantity"),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5),
    };

    // Then group by granularity for charts
    const groupedSales = groupBy(sales, (sale) => {
      const date = new Date(sale.date);
      switch (granularity) {
        case "daily":
          return date.toISOString().split("T")[0];
        case "weekly":
          const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
          const weekNumber = Math.ceil(
            ((date.getTime() - firstDayOfYear.getTime()) / 86400000 + 1) / 7
          );
          // Return the date of the first day of the week
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          return weekStart.toISOString().split("T")[0];
        case "monthly":
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
        case "yearly":
          return date.getFullYear().toString();
        default:
          return date.toISOString().split("T")[0];
      }
    });

    return Object.entries(groupedSales).map(([date, salesData]) => {
      const periodExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);
        const saleDate = new Date(date);

        switch (granularity) {
          case "daily":
            return expenseDate.toISOString().split("T")[0] === date;
          case "weekly":
            const expenseWeek = Math.ceil((expenseDate.getDate() + 6) / 7);
            const saleWeek = Math.ceil((saleDate.getDate() + 6) / 7);
            return (
              expenseWeek === saleWeek &&
              expenseDate.getFullYear() === saleDate.getFullYear()
            );
          case "monthly":
            return (
              expenseDate.getMonth() === saleDate.getMonth() &&
              expenseDate.getFullYear() === saleDate.getFullYear()
            );
          case "yearly":
            return expenseDate.getFullYear() === saleDate.getFullYear();
          default:
            return false;
        }
      });

      return {
        date,
        sales: sumBy(salesData, "revenue"),
        profit: sumBy(salesData, "profit"),
        expenses: sumBy(periodExpenses, "amount"),
        netProfit: sumBy(salesData, "profit") - sumBy(periodExpenses, "amount"),
        topProducts: timeRangeMetrics.topProducts, // Use the time-range based metrics
      };
    });
  }, [rawData, granularity]);

  return {
    rawData,
    processedData,
    isLoading,
    error,
  };
}
