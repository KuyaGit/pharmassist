import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api-config";
import { getCookie } from "@/lib/cookie";

export function useProductAnalytics(productId: number, timeRange: string) {
  const [productData, setProductData] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [branchPerformance, setBranchPerformance] = useState<any[]>([]);
  const [branchStock, setBranchStocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const token = getCookie("token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${API_BASE_URL}/analytics/product/${productId}?time_range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch product analytics");
      const data = await response.json();
      setProductData(data);
      setPriceHistory(data.price_history);
      setBranchPerformance(data.branch_performance);
      setBranchStocks(data.stock_analytics.branch_stocks);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [productId, timeRange]);

  return {
    productData,
    priceHistory,
    branchPerformance,
    isLoading,
    error,
    branchStock,
    refetch: fetchData,
  };
}
