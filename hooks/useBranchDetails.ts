import { useState, useEffect } from "react";
import { getCookie } from "@/lib/cookie";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";
import {
  Branch,
  BranchInventory,
  BranchReport,
  SalesData,
  CategorySales,
} from "@/types/branch";

export function useBranchDetails(branchId: number) {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [inventory, setInventory] = useState<BranchInventory[]>([]);
  const [reports, setReports] = useState<BranchReport[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
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

        const branchResponse = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.BRANCHES.GET(branchId)}`,
          { headers }
        );

        if (!branchResponse.ok) {
          const errorData = await branchResponse.json();
          throw new Error(errorData.detail || "Failed to fetch branch details");
        }

        const branchData = await branchResponse.json();
        setBranch(branchData);

        // Mock data for now until backend endpoints are ready
        setInventory([
          {
            id: 1,
            product_name: "Product A",
            stock_level: 45,
            expiry_date: "2024-12-31",
            branch_name: branchData.branch_name,
          },
          // Add more mock items as needed
        ]);

        setReports([
          {
            id: 1,
            date_created: "2024-03-20",
            status: "pending",
            branch_id: branchId,
          },
          // Add more mock items as needed
        ]);

        setSalesData([
          { month: "January", sales: 5000, profit: 1500 },
          { month: "February", sales: 6000, profit: 1800 },
          // Add more mock months
        ]);

        setCategorySales([
          { name: "Prescription", value: 4000 },
          { name: "OTC", value: 3000 },
          { name: "Personal Care", value: 2000 },
          { name: "Supplements", value: 1500 },
          { name: "Other", value: 500 },
        ]);
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
    categorySales,
    isLoading,
    error,
  };
}
