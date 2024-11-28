"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faClipboardList,
  faExclamationTriangle,
  faClock,
  faDollarSign,
  faChartLine,
  faMoneyBillWave,
  faReceipt,
  faPercent,
  faCashRegister,
  faMoneyBillTrendUp,
  faScaleBalanced,
  faSackDollar,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
  Sector,
} from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLoading } from "@/components/providers/loading-provider";
import { useBranchDetails } from "@/hooks/useBranchDetails";
import { BranchInventory, BranchReport, SalesData } from "@/types/branch";
import { useBranchAnalytics } from "@/hooks/useBranchAnalytics";
import { TimeRange } from "@/types/analytics";
import { TimeGranularity } from "@/types/analytics";
import { format } from "date-fns";
import { ExpenseDataPoint } from "@/types/expense";
import { getTimeRangeDescription, getMetricTitle } from "@/lib/utils";
import { getCookie } from "cookies-next";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";

const inventoryColumns: ColumnDef<BranchInventory>[] = [
  {
    accessorKey: "product_name",
    header: "Product",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "srp",
    header: "SRP",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("srp"));
      return `₱${amount.toLocaleString()}`;
    },
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost"));
      return `₱${amount.toLocaleString()}`;
    },
  },
];

const reportColumns: ColumnDef<BranchReport>[] = [
  {
    accessorKey: "id",
    header: "Report ID",
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) =>
      format(new Date(row.getValue("start_date")), "MMM d, yyyy"),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) =>
      format(new Date(row.getValue("end_date")), "MMM d, yyyy"),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) =>
      format(new Date(row.getValue("created_at")), "MMM d, yyyy"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "pending" ? "secondary" : "default"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
];

function calculateGrowthRate(
  data: { date: string; sales: number }[],
  timeRange: TimeRange
): string {
  // Sort data by date in descending order
  const sortedData = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let periodLength: number;
  switch (timeRange) {
    case "7d":
      periodLength = 7;
      break;
    case "30d":
      periodLength = 30;
      break;
    case "90d":
      periodLength = 90;
      break;
    case "1y":
      periodLength = 365;
      break;
    default:
      return "0.0";
  }

  // Get current and previous period data
  const currentPeriod = sortedData.slice(0, periodLength);
  const previousPeriod = sortedData.slice(periodLength, periodLength * 2);

  // Check if we have enough data
  if (currentPeriod.length === 0 || previousPeriod.length === 0) return "0.0";

  const currentTotal = currentPeriod.reduce((sum, d) => sum + d.sales, 0);
  const previousTotal = previousPeriod.reduce((sum, d) => sum + d.sales, 0);

  if (previousTotal === 0) return "0.0";

  const growthRate = ((currentTotal - previousTotal) / previousTotal) * 100;
  return growthRate.toFixed(1);
}

// Add this helper function after getTimeRangeDescription
const getValidGranularities = (range: TimeRange): TimeGranularity[] => {
  switch (range) {
    case "7d":
      return ["daily"];
    case "30d":
      return ["daily", "weekly"];
    case "90d":
      return ["daily", "weekly", "monthly"];
    case "1y":
      return ["daily", "weekly", "monthly", "yearly"];
    default:
      return ["daily"];
  }
};

export default function BranchDetails() {
  const params = useParams();
  const branchId = parseInt(params.id as string);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [granularity, setGranularity] = useState<TimeGranularity>("daily");

  const {
    branch,
    inventory: branchInventory,
    reports: branchReports,
    isLoading: branchLoading,
    error: branchError,
  } = useBranchDetails(branchId, timeRange);
  const { rawData, processedData, isLoading, error } = useBranchAnalytics(
    Number(branchId),
    timeRange,
    granularity
  );

  const totalSales =
    processedData?.reduce((sum, data) => sum + data.sales, 0) ?? 0;
  const grossProfit =
    processedData?.reduce((sum, data) => sum + data.profit, 0) ?? 0;
  const totalExpenses =
    processedData?.reduce((sum, data) => sum + data.expenses, 0) ?? 0;
  const netProfit = grossProfit - totalExpenses;

  const chartConfig: ChartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--primary))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--destructive))",
    },
    profit: {
      label: "Gross Profit",
      color: "hsl(var(--success))",
    },
    netProfit: {
      label: "Net Profit",
      color: "hsl(var(--warning))",
    },
  };

  const expensesChartConfig: ChartConfig = {
    expenses: {
      label: "Total Expenses",
      color: "hsl(var(--destructive))",
    },
    daily_average: {
      label: "Daily Average",
      color: "hsl(var(--warning))",
    },
  };

  const chartData =
    processedData?.map((data) => ({
      date: data.date,
      sales: data.sales,
      profit: data.profit,
      netProfit: data.netProfit,
      expenses: data.expenses,
    })) ?? [];

  const calculateInsights = (data: typeof chartData, timeRange: TimeRange) => {
    if (!data.length) return { trend: 0, highestDay: null, lowestDay: null };

    // Get the appropriate number of days based on time range
    const periodLength =
      timeRange === "7d"
        ? 7
        : timeRange === "30d"
        ? 30
        : timeRange === "90d"
        ? 90
        : 365;

    const currentPeriod = data.slice(-periodLength);
    const previousPeriod = data.slice(-periodLength * 2, -periodLength);

    const currentAvg =
      currentPeriod.reduce((sum, d) => sum + d.sales, 0) /
      (currentPeriod.length || 1);
    const prevAvg =
      previousPeriod.reduce((sum, d) => sum + d.sales, 0) /
      (previousPeriod.length || 1);

    const trend = prevAvg === 0 ? 0 : ((currentAvg - prevAvg) / prevAvg) * 100;

    const highestDay = [...currentPeriod].sort((a, b) => b.sales - a.sales)[0];
    const lowestDay = [...currentPeriod].sort((a, b) => a.sales - b.sales)[0];

    return {
      trend: isNaN(trend) ? 0 : trend,
      highestDay,
      lowestDay,
    };
  };

  // Get the latest top products from the most recent data point
  const topProducts =
    processedData?.[processedData.length - 1]?.topProducts ?? [];

  // Add a new state for current month data
  const [currentMonthData, setCurrentMonthData] = useState<{ sales: any[] }>({
    sales: [],
  });

  // Add a new useEffect to fetch current month data
  useEffect(() => {
    async function fetchCurrentMonthData() {
      try {
        const token = getCookie("token");
        if (!token) throw new Error("Authentication token not found");

        const currentDate = new Date();
        const firstDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        const lastDayOfMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        );

        const response = await fetch(
          `${API_BASE_URL}${
            API_ENDPOINTS.ANALYTICS.BRANCH
          }/${branchId}?start_date=${firstDayOfMonth.toISOString()}&end_date=${lastDayOfMonth.toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch current month data");
        const data = await response.json();
        console.log("Current month data:", data);
        setCurrentMonthData(data);
      } catch (err) {
        console.error("Error fetching current month data:", err);
      }
    }

    fetchCurrentMonthData();
  }, [branchId]); // Only depends on branchId, not timeRange

  // Update the currentMonthRevenue calculation to use currentMonthData
  const currentMonthRevenue = useMemo(() => {
    if (!currentMonthData?.sales) return 0;
    return currentMonthData.sales.reduce((sum, sale) => {
      // Check if the sale object has the expected structure
      const revenue =
        typeof sale === "object" ? sale.revenue || sale.sales || 0 : 0;
      return sum + revenue;
    }, 0);
  }, [currentMonthData?.sales]);

  useEffect(() => {
    const validGranularities = getValidGranularities(timeRange);
    if (!validGranularities.includes(granularity)) {
      setGranularity(validGranularities[0]);
    }
  }, [timeRange, granularity]);

  // Add new state for recent expenses
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);

  // Add new useEffect to fetch recent expenses
  useEffect(() => {
    async function fetchRecentExpenses() {
      try {
        const token = getCookie("token");
        if (!token) throw new Error("Authentication token not found");

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.EXPENSES.LIST}?branch_id=${branchId}&limit=5`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch recent expenses");
        const data = await response.json();
        setRecentExpenses(data);
      } catch (err) {
        console.error("Error fetching recent expenses:", err);
      }
    }

    fetchRecentExpenses();
  }, [branchId]);

  const calculateChartInsights = (data: typeof chartData) => {
    if (!data.length)
      return { salesExpenseRatio: 0, profitTrend: 0, highestProfit: null };

    // Calculate sales to expense ratio
    const totalSales = data.reduce((sum, d) => sum + d.sales, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
    const salesExpenseRatio = totalSales / totalExpenses;

    // Calculate profit trend (last 3 points vs previous 3 points)
    const last3Points = data.slice(-3);
    const prev3Points = data.slice(-6, -3);
    const recentProfitAvg =
      last3Points.reduce((sum, d) => sum + d.netProfit, 0) / 3;
    const prevProfitAvg =
      prev3Points.reduce((sum, d) => sum + d.netProfit, 0) / 3;
    const profitTrend =
      ((recentProfitAvg - prevProfitAvg) / prevProfitAvg) * 100;

    // Find highest profit point
    const highestProfit = [...data].sort(
      (a, b) => b.netProfit - a.netProfit
    )[0];

    return { salesExpenseRatio, profitTrend, highestProfit };
  };

  if (branchError || error) {
    return <div>Error loading data: {branchError || error}</div>;
  }

  if (branchLoading || isLoading || !branch) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {branch.branch_name}
                </h1>
                <Badge
                  variant={branch.is_active ? "success" : "secondary"}
                  className="text-sm"
                >
                  {branch.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {branch.branch_type.charAt(0).toUpperCase() +
                  branch.branch_type.slice(1)}{" "}
                Branch • {branch.location}
              </p>
            </div>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/branches">Branches</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/branches/${branchId}`}>
                  {branch.branch_name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Branch Performance
            </h2>
            <div className="flex items-center gap-4">
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
              <Select
                value={granularity}
                onValueChange={(value: TimeGranularity) =>
                  setGranularity(value)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select granularity" />
                </SelectTrigger>
                <SelectContent>
                  {getValidGranularities(timeRange).map((g) => (
                    <SelectItem key={g} value={g}>
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Month Revenue
                </CardTitle>
                <FontAwesomeIcon
                  icon={faCashRegister}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱{currentMonthRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Revenue for current month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {getMetricTitle(timeRange)} Expenses
                </CardTitle>
                <FontAwesomeIcon
                  icon={faSackDollar}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱{totalExpenses.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total expenses for {getTimeRangeDescription(timeRange)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Profit Margin
                </CardTitle>
                <FontAwesomeIcon
                  icon={faMoneyBillTrendUp}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {((grossProfit / totalSales) * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average profit margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Growth Rate
                </CardTitle>
                <FontAwesomeIcon
                  icon={faChartLine}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {calculateGrowthRate(processedData || [], timeRange)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Growth rate for {getTimeRangeDescription(timeRange)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  ₱{totalSales.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTimeRangeDescription(timeRange)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
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
                  ₱{grossProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTimeRangeDescription(timeRange)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Net Profit
                </CardTitle>
                <FontAwesomeIcon
                  icon={faScaleBalanced}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱{netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getTimeRangeDescription(timeRange)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Sales and Profit Trend</CardTitle>
                  <CardDescription>Performance over time</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="var(--color-sales)"
                      strokeWidth={2}
                      dot={false}
                      name="Sales"
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="var(--color-expenses)"
                      strokeWidth={2}
                      dot={false}
                      name="Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="var(--color-profit)"
                      strokeWidth={2}
                      dot={false}
                      name="Gross Profit"
                    />
                    <Line
                      type="monotone"
                      dataKey="netProfit"
                      stroke="var(--color-netProfit)"
                      strokeWidth={2}
                      dot={false}
                      name="Net Profit"
                    />
                    <Legend />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full flex-col gap-3">
                  {(() => {
                    const { salesExpenseRatio, profitTrend, highestProfit } =
                      calculateChartInsights(chartData);
                    return (
                      <>
                        <div className="flex items-center gap-2 font-medium">
                          <span>
                            Sales to Expense Ratio:{" "}
                            {salesExpenseRatio.toFixed(2)}x
                          </span>
                          {profitTrend !== 0 && (
                            <span
                              className={cn(
                                "ml-4",
                                profitTrend > 0
                                  ? "text-success"
                                  : "text-destructive"
                              )}
                            >
                              ({Math.abs(profitTrend).toFixed(1)}%{" "}
                              {profitTrend > 0 ? "upward" : "downward"} profit
                              trend)
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Best performing day:{" "}
                            {highestProfit?.date
                              ? format(new Date(highestProfit.date), "MMM d")
                              : "(No date)"}{" "}
                            with ₱{highestProfit?.netProfit.toLocaleString()}{" "}
                            net profit
                          </p>
                          <p>
                            Revenue covers expenses{" "}
                            {salesExpenseRatio.toFixed(1)} times on average
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardFooter>
            </Card>

            <Card className="col-span-2 flex flex-col md:col-span-1">
              <CardHeader>
                <CardTitle>{getMetricTitle(timeRange)} Top Products</CardTitle>
                <CardDescription>
                  {getTimeRangeDescription(timeRange)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center">
                      <div className="w-8 text-sm font-medium">{index + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {product.quantity} units sold
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm font-medium">
                        ₱{product.value.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Top product: {topProducts[0]?.name ?? "No data"}
                </div>
                <div className="leading-none text-muted-foreground">
                  By sales value in current period
                </div>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{getMetricTitle(timeRange)} Expenses</CardTitle>
                <CardDescription>
                  {getTimeRangeDescription(timeRange)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={expensesChartConfig}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke={expensesChartConfig.expenses.color}
                      strokeWidth={2}
                      dot={false}
                      name="Total Expenses"
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full flex-col gap-3">
                  {(() => {
                    const dailyAvg = totalExpenses / chartData.length;
                    const expensesData = chartData.map((d) => ({
                      date: d.date,
                      amount: d.expenses,
                    }));
                    const sortedExpenses = [...expensesData].sort(
                      (a, b) => b.amount - a.amount
                    );

                    return (
                      <>
                        <div className="flex items-center gap-2 font-medium">
                          <span>
                            Daily average: ₱
                            {dailyAvg.toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            Highest expense: ₱
                            {sortedExpenses[0]?.amount.toLocaleString()}{" "}
                            {sortedExpenses[0]?.date
                              ? `(${format(
                                  new Date(sortedExpenses[0].date),
                                  "MMM d"
                                )})`
                              : "(No date)"}
                          </p>
                          <p>
                            Lowest expense: ₱
                            {sortedExpenses[
                              sortedExpenses.length - 1
                            ]?.amount.toLocaleString()}{" "}
                            {sortedExpenses[sortedExpenses.length - 1]?.date
                              ? `(${format(
                                  new Date(
                                    sortedExpenses[
                                      sortedExpenses.length - 1
                                    ].date
                                  ),
                                  "MMM d"
                                )})`
                              : "(No date)"}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardFooter>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>
                  Latest 5 expenses for this branch
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  {recentExpenses?.map((expense, index) => (
                    <div key={expense.id} className="flex items-center">
                      <div className="w-8 text-sm font-medium">{index + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {expense.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {expense.vendor || "No vendor"} •{" "}
                          {format(
                            new Date(expense.date_created),
                            "MMM d, yyyy"
                          )}
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm font-medium">
                        ₱{expense.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Latest expense: {recentExpenses[0]?.name ?? "No expenses"}
                </div>
                <div className="leading-none text-muted-foreground">
                  Most recent branch expenses
                </div>
              </CardFooter>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
