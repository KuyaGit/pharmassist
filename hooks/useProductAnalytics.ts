import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api-config";
import { getCookie } from "@/lib/cookie";
import { useQuery } from "@tanstack/react-query";
import { TimeRange } from "@/types/analytics";

export function useProductAnalytics(
  productId: number,
  timeRange: TimeRange,
  branchType: "retail" | "wholesale"
) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["product-analytics", productId, timeRange, branchType],
    queryFn: async () => {
      const token = getCookie("token");
      const response = await fetch(
        `${API_BASE_URL}/analytics/product/${productId}?time_range=${timeRange}&branch_type=${branchType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch product analytics");
      return response.json();
    },
  });

  return {
    productData: data,
    priceHistory: data?.price_history ?? [],
    branchPerformance: data?.branch_performance ?? [],
    isLoading,
    error,
    refetch,
  };
}
