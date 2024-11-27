import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookie";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";
import {
  Branch,
  BranchInventory,
  BranchReport,
  SalesData,
  TopProduct,
} from "@/types/branch";

export function useBranchDetails(branchId: number, timeRange: string) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [inventory, setInventory] = useState<BranchInventory[]>([]);
  const [reports, setReports] = useState<BranchReport[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBranchDetails() {
      try {
        const token = getCookie("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        // Fetch branch details
        const branchResponse = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.BRANCHES.GET(branchId)}`,
          { headers }
        );

        if (!branchResponse.ok) {
          throw new Error("Failed to fetch branch details");
        }

        const branchData = await branchResponse.json();
        setBranch(branchData);

        // Fetch analytics data
        const analyticsResponse = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.ANALYTICS.BRANCH}/${branchId}?time_range=${timeRange}`,
          {
            headers,
          }
        );

        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const analyticsData = await analyticsResponse.json();
        setSalesData(analyticsData.salesData);
        setTopProducts(analyticsData.topProducts);
        setTotalExpenses(analyticsData.totalExpenses);

        // Fetch inventory and reports
        // ... (keep existing inventory and reports fetching code)
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBranchDetails();
  }, [branchId]);

  return {
    branch,
    inventory,
    reports,
    salesData,
    topProducts,
    totalExpenses,
    isLoading,
    error,
  };
}
