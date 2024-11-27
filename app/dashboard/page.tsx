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
import { formatCurrency } from "@/lib/utils";

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
  const [timeRange, setTimeRange] = useState("30d");
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        `${API_BASE_URL}${API_ENDPOINTS.ANALYTICS.OVERVIEW}?time_range=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch analytics");

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-2))",
    },
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-3))",
    },
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Select value={timeRange} onValueChange={setTimeRange}>
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

          {/* Key Performance Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold">
                  Total Revenue
                </CardTitle>
                <FontAwesomeIcon
                  icon={faCashRegister}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_revenue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={`flex items-center gap-1 ${getChangeClass(
                      analytics?.revenue_change
                    )}`}
                  >
                    {analytics?.revenue_change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatPercentage(analytics?.revenue_change)}% from previous
                    period
                  </span>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold">
                  Gross Profit
                </CardTitle>
                <FontAwesomeIcon
                  icon={faMoneyBillTrendUp}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics?.gross_profit || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(analytics?.gross_profit_margin)}% margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold">Net Profit</CardTitle>
                <FontAwesomeIcon
                  icon={faScaleBalanced}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics?.net_profit || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(analytics?.net_profit_margin)}% margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold">
                  Total Expenses
                </CardTitle>
                <FontAwesomeIcon
                  icon={faSackDollar}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.total_expenses)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span
                    className={`flex items-center gap-1 ${getChangeClass(
                      analytics?.expenses_change,
                      true
                    )}`}
                  >
                    {analytics?.expenses_change >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {formatPercentage(analytics?.expenses_change)}% from
                    previous period
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="branches">Branches</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Revenue vs Expenses</CardTitle>
                    <CardDescription>
                      Comparison over the selected period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <LineChart
                        data={analytics.timeline_data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke={chartConfig.revenue.color}
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke={chartConfig.expenses.color}
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="profit"
                          stroke={chartConfig.profit.color}
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
                    <CardDescription>By revenue</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <BarChart
                        data={analytics.branch_performance.slice(0, 5)}
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={false}
                        />
                        <XAxis type="number" />
                        <YAxis
                          dataKey="branch_name"
                          type="category"
                          tickLine={false}
                          axisLine={false}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent />}
                        />
                        <Bar
                          dataKey="total_sales"
                          fill={chartConfig.revenue.color}
                        />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="branches">
              <Card>
                <CardHeader>
                  <CardTitle>Branch Performance</CardTitle>
                  <CardDescription>
                    Detailed metrics for all branches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={[
                      {
                        accessorKey: "branch_name",
                        header: "Branch Name",
                      },
                      {
                        accessorKey: "total_sales",
                        header: "Revenue",
                        cell: ({ row }) =>
                          formatCurrency(row.getValue("total_sales")),
                      },
                      {
                        accessorKey: "total_expenses",
                        header: "Expenses",
                        cell: ({ row }) =>
                          formatCurrency(row.getValue("total_expenses")),
                      },
                      {
                        accessorKey: "profit",
                        header: "Profit",
                        cell: ({ row }) =>
                          formatCurrency(row.getValue("profit")),
                      },
                    ]}
                    data={analytics.branch_performance}
                    enableFiltering
                    enableSorting
                    filterColumn="branch_name"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Continue with Products and Expenses tabs... */}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
