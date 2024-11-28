"use client";

import { useState, useEffect } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faSackDollar,
  faHandHoldingDollar,
  faChartLine,
  faBoxesStacked,
  faClock,
  faShoppingCart,
  faStore,
  faMoneyBillTrendUp,
  faScaleBalanced,
  faMoneyBillWave,
  faWarehouse,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DataTable } from "@/components/DataTable";
import { TrendingUp, TrendingDown } from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import {
  formatCurrency,
  getMetricTitle,
  getTimeRangeDescription,
} from "@/lib/utils";
import { TimeRange } from "@/types/analytics";
import { Badge } from "@/components/ui/badge";
import { ReactNode } from "react";
import { format } from "date-fns";

interface BranchPerformance {
  branch_id: number;
  branch_name: string;
  total_sales: number;
  revenue: number;
  total_expenses: number;
  profit: number;
}

interface Analytics {
  total_revenue: number;
  total_sales: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  active_branches: number;
  branch_performance: BranchPerformance[];
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
  }>;
  inventory: {
    total_products: number;
    low_stock_count: number;
    out_of_stock_count: number;
    near_expiry_count: number;
  };
}

const formatPercentage = (value: number | undefined | null): string => {
  return value ? value.toFixed(1) : "0.0";
};

const getChangeClass = (
  change: number | undefined | null,
  inverse: boolean = false
): string => {
  if (!change) return "text-muted-foreground";
  const isPositive = change >= 0;
  return isPositive
    ? inverse
      ? "text-red-600 dark:text-red-400"
      : "text-green-600 dark:text-green-400"
    : inverse
    ? "text-green-600 dark:text-green-400"
    : "text-red-600 dark:text-red-400";
};

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/pharmassist";
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ANALYTICS.ROOT}?time_range=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  const chartConfig = {
    revenue: {
      label: { label: "Revenue" },
      color: { color: "hsl(var(--chart-1))" },
    },
    expenses: {
      label: { label: "Expenses" },
      color: { color: "hsl(var(--chart-2))" },
    },
    profit: {
      label: { label: "Profit" },
      color: { color: "hsl(var(--chart-3))" },
    },
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          {error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Overall performance metrics across all branches
                  </p>
                </div>
                <Select
                  value={timeRange}
                  onValueChange={(value: TimeRange) => setTimeRange(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Revenue
                    </CardTitle>
                    <FontAwesomeIcon
                      icon={faMoneyBillWave}
                      size="2x"
                      className="text-icon"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₱{analytics?.total_revenue?.toLocaleString() ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getTimeRangeDescription(timeRange)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Sales
                    </CardTitle>
                    <FontAwesomeIcon
                      icon={faCashRegister}
                      size="2x"
                      className="text-icon"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.total_sales?.toLocaleString() ?? 0} units
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Across all branches
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Profit Margin
                    </CardTitle>
                    <FontAwesomeIcon
                      icon={faChartLine}
                      size="2x"
                      className="text-icon"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(analytics?.profit_margin ?? 0).toFixed(2)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Overall profit margin
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Branches
                    </CardTitle>
                    <FontAwesomeIcon
                      icon={faWarehouse}
                      size="2x"
                      className="text-icon"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.active_branches ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Currently operating branches
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>
                      {getMetricTitle(timeRange)} Revenue Trend
                    </CardTitle>
                    <CardDescription>
                      {getTimeRangeDescription(timeRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig.revenue}>
                      <LineChart
                        data={analytics?.revenue_trend ?? []}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="timestamp"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) =>
                            format(new Date(value), "MMM d")
                          }
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) =>
                            `₱${value.toLocaleString()}`
                          }
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={chartConfig.revenue.color.color}
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Top Performing Branches</CardTitle>
                    <CardDescription>
                      By revenue in {getTimeRangeDescription(timeRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.branch_performance
                        ?.sort((a, b) => b.revenue - a.revenue)
                        ?.slice(0, 5)
                        ?.map((branch, index) => (
                          <div
                            key={branch.branch_id}
                            className="flex items-center"
                          >
                            <div className="w-8 text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {branch.branch_name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {branch.total_sales?.toLocaleString() ?? 0}{" "}
                                units sold
                              </div>
                            </div>
                            <div className="w-24 text-right text-sm font-medium">
                              ₱{branch.revenue?.toLocaleString() ?? 0}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>
                      Best selling products by revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.top_products
                        ?.slice(0, 5)
                        ?.map((product, index) => (
                          <div key={product.id} className="flex items-center">
                            <div className="w-8 text-sm font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {product.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {product.total_sales?.toLocaleString() ?? 0}{" "}
                                units sold
                              </div>
                            </div>
                            <div className="w-24 text-right text-sm font-medium">
                              ₱{product.revenue?.toLocaleString() ?? 0}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Status</CardTitle>
                    <CardDescription>Overall inventory health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Total Products
                        </span>
                        <span className="text-sm font-medium">
                          {analytics?.inventory?.total_products ?? 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Low Stock Items
                        </span>
                        <Badge variant="destructive">
                          {analytics?.inventory?.low_stock_count ?? 0} products
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Out of Stock
                        </span>
                        <Badge variant="destructive">
                          {analytics?.inventory?.out_of_stock_count ?? 0}{" "}
                          products
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Near Expiry
                        </span>
                        <Badge variant="warning">
                          {analytics?.inventory?.near_expiry_count ?? 0}{" "}
                          products
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
