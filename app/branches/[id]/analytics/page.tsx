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
  faLightbulb,
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
  ComposedChart,
  ReferenceLine,
  Bar,
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

const getDateFormat = (granularity: TimeGranularity) => {
  switch (granularity) {
    case "daily":
      return "MMM dd";
    case "weekly":
      return "'Week' w, MMM d";
    case "monthly":
      return "MMMM yyyy";
    case "yearly":
      return "yyyy";
    default:
      return "MMM dd";
  }
};

// Add this helper function to get week date range
const getWeekDateRange = (date: Date) => {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay()); // Get Sunday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // Get Saturday

  return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`;
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
          `${API_BASE_URL}${API_ENDPOINTS.EXPENSES.LIST}?branch_id=${branchId}&limit=10`,
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

  const config = {
    income: {
      label: "Gross Profit",
      color: "hsl(var(--chart-income))",
      legendColor: "hsl(var(--chart-income-legend))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-expenses))",
      legendColor: "hsl(var(--chart-expenses-legend))",
    },
    profit: {
      label: "Net Profit",
      color: "hsl(var(--chart-net-profit))",
      legendColor: "hsl(var(--chart-net-profit-legend))",
    },
  };

  const getPeriodDays = (granularity: TimeGranularity) => {
    switch (granularity) {
      case "daily":
        return 1;
      case "weekly":
        return 7;
      case "monthly":
        return 30;
      case "yearly":
        return 365;
      default:
        return 1;
    }
  };

  const periodAvg = totalExpenses / chartData.length;

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
                <CardTitle>Financial Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={config} className="h-[400px] w-full">
                  <ComposedChart
                    data={chartData.map((data) => ({
                      month:
                        granularity === "weekly"
                          ? getWeekDateRange(new Date(data.date))
                          : format(
                              new Date(data.date),
                              getDateFormat(granularity)
                            ),
                      income: data.profit,
                      expenses: -Math.abs(data.expenses),
                      profit: data.netProfit,
                    }))}
                    margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                    width={window.innerWidth * 0.6}
                    height={400}
                    stackOffset="sign"
                    barGap={0}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      minTickGap={30}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        `₱${Math.abs(value).toLocaleString()}`
                      }
                    />
                    <ReferenceLine y={0} stroke="var(--border)" />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const colors = {
                          income: "hsl(var(--chart-income))",
                          expenses: "hsl(var(--chart-expenses))",
                          profit: "hsl(var(--chart-net-profit))",
                        };
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">
                                  {payload[0].payload.month}
                                </span>
                              </div>
                              {payload.map((entry) => (
                                <div
                                  key={entry.name}
                                  className="flex items-center justify-between gap-2 text-foreground"
                                >
                                  <span className="flex items-center gap-2">
                                    <div
                                      className="h-2 w-2 rounded-full"
                                      style={{
                                        background:
                                          colors[
                                            entry.dataKey as keyof typeof colors
                                          ],
                                      }}
                                    />
                                    {entry.name}:
                                  </span>
                                  <span className="font-medium">
                                    ₱
                                    {(entry.dataKey === "expenses"
                                      ? Math.abs(Number(entry.value) || 0)
                                      : Number(entry.value) || 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="income"
                      fill="hsl(var(--chart-income))"
                      radius={[4, 4, 0, 0]}
                      barSize={40}
                      stackId="stack"
                      name="Gross Profit"
                    />
                    <Bar
                      dataKey="expenses"
                      fill="hsl(var(--chart-expenses))"
                      radius={[0, 0, 4, 4]}
                      barSize={40}
                      stackId="stack"
                      name="Expenses"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="hsl(var(--chart-net-profit))"
                      strokeWidth={2}
                      dot={{
                        stroke: "hsl(var(--chart-net-profit))",
                        strokeWidth: 2,
                        fill: "white",
                        r: 4,
                      }}
                      name="Net Profit"
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value, entry: any) => {
                        const key = entry.payload
                          .dataKey as keyof typeof config;
                        return (
                          <span style={{ color: "hsl(var(--foreground))" }}>
                            {value}
                          </span>
                        );
                      }}
                    />
                  </ComposedChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="text-yellow-500"
                    />
                    <span className="font-semibold">
                      Insights & Recommendations
                    </span>
                  </div>
                  {(() => {
                    const { salesExpenseRatio, profitTrend, highestProfit } =
                      calculateChartInsights(chartData);
                    const isNegativeProfit = chartData.some(
                      (d) => d.netProfit < 0
                    );

                    return (
                      <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-2">
                        {/* Sales to Expense Ratio Insight */}
                        <p>
                          <span className="font-medium">
                            Sales/Expense Ratio:{" "}
                          </span>
                          {salesExpenseRatio < 1.5 ? (
                            <span className="text-destructive">
                              Your sales to expense ratio is{" "}
                              {salesExpenseRatio.toFixed(2)}. Consider reducing
                              operational costs or increasing sales volume.
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">
                              Healthy sales to expense ratio of{" "}
                              {salesExpenseRatio.toFixed(2)}.
                            </span>
                          )}
                        </p>

                        {/* Profit Trend Insight */}
                        <p>
                          <span className="font-medium">Profit Trend: </span>
                          {profitTrend < 0 ? (
                            <span className="text-destructive">
                              Declining profit trend ({profitTrend.toFixed(1)}
                              %). Review pricing strategy and cost management.
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">
                              Positive profit growth of {profitTrend.toFixed(1)}
                              %.
                            </span>
                          )}
                        </p>

                        {/* Negative Profit Warning */}
                        {isNegativeProfit && (
                          <p className="text-destructive font-medium">
                            ⚠️ Warning: Negative profit detected in some
                            periods. Immediate action recommended:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Review and optimize operational expenses</li>
                              <li>Analyze pricing strategy</li>
                              <li>Consider inventory management efficiency</li>
                            </ul>
                          </p>
                        )}

                        {/* Best Performance */}
                        {highestProfit && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">
                              Best Performance:{" "}
                            </span>
                            ₱{highestProfit.netProfit.toLocaleString()} on{" "}
                            {format(
                              new Date(highestProfit.date),
                              "MMM d, yyyy"
                            )}
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
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
                <CardTitle>
                  {getMetricTitle(timeRange)} Expense Analysis
                </CardTitle>
                <CardDescription>
                  {getTimeRangeDescription(timeRange)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={expensesChartConfig}>
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return granularity === "weekly"
                          ? getWeekDateRange(new Date(value))
                          : format(date, getDateFormat(granularity));
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => `₱${value.toLocaleString()}`}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const date = new Date(payload[0].payload.date);
                        const averageExpense = periodAvg;
                        const highestExpense = Math.max(
                          ...chartData.map((d) => d.expenses)
                        );
                        const expenseVariance =
                          (highestExpense / averageExpense - 1) * 100;
                        const hasHighVariance = expenseVariance > 25; // 25% threshold

                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="grid gap-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium">
                                  {granularity === "weekly"
                                    ? getWeekDateRange(date)
                                    : format(date, getDateFormat(granularity))}
                                </span>
                              </div>
                              <div className="grid gap-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    Expenses:
                                  </span>
                                  <span className="font-medium">
                                    ₱
                                    {(
                                      payload?.[0]?.value ?? 0
                                    ).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    vs Average:
                                  </span>
                                  <span
                                    className={cn(
                                      "font-medium",
                                      Number(payload?.[0]?.value ?? 0) >
                                        periodAvg
                                        ? "text-destructive"
                                        : "text-green-600 dark:text-green-400"
                                    )}
                                  >
                                    {(
                                      (Number(payload?.[0]?.value ?? 0) /
                                        periodAvg -
                                        1) *
                                      100
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="expenses"
                      fill="hsl(var(--destructive))"
                      radius={[4, 4, 0, 0]}
                      name="Expenses"
                    />
                    <ReferenceLine
                      y={periodAvg}
                      stroke="hsl(var(--warning))"
                      strokeDasharray="3 3"
                      label={{
                        value: "Period Average",
                        position: "right",
                        fill: "hsl(var(--warning))",
                      }}
                    />
                  </ComposedChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="text-yellow-500"
                    />
                    <span className="font-semibold">Expense Insights</span>
                  </div>
                  {(() => {
                    const averageExpense = periodAvg;
                    const highestExpense = Math.max(
                      ...chartData.map((d) => d.expenses)
                    );
                    const expenseVariance =
                      (highestExpense / averageExpense - 1) * 100;
                    const hasHighVariance = expenseVariance > 25; // 25% threshold

                    return (
                      <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-2">
                        {/* Average Expense Analysis */}
                        <p>
                          <span className="font-medium">Period Average: </span>
                          {averageExpense >
                          (totalExpenses / chartData.length) * 1.2 ? (
                            <span className="text-destructive">
                              Expenses are trending higher than usual. Consider
                              reviewing recurring costs.
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">
                              Expenses are within normal range.
                            </span>
                          )}
                        </p>

                        {/* Expense Variance Warning */}
                        {hasHighVariance && (
                          <p className="text-destructive">
                            <span className="font-medium">
                              ⚠️ High Expense Variance:{" "}
                            </span>
                            Peak expenses are {expenseVariance.toFixed(1)}%
                            above average. Recommendations:
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Review unusual spikes in spending</li>
                              <li>
                                Consider expense scheduling to avoid peaks
                              </li>
                              <li>Evaluate bulk purchase opportunities</li>
                            </ul>
                          </p>
                        )}

                        {/* Expense Pattern */}
                        <p className="text-muted-foreground">
                          <span className="font-medium">
                            Highest Expense Period:{" "}
                          </span>
                          ₱{highestExpense.toLocaleString()} (
                          {(() => {
                            const expenseData = chartData.find(
                              (d) => d.expenses === highestExpense
                            );

                            if (!expenseData?.date) {
                              return "No date available";
                            }

                            try {
                              return format(
                                new Date(expenseData.date),
                                granularity === "monthly"
                                  ? "MMMM yyyy"
                                  : "MMM d, yyyy"
                              );
                            } catch (error) {
                              console.error("Date formatting error:", error);
                              return "Invalid date";
                            }
                          })()}
                          )
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
              <CardFooter>
                <div className="grid w-full grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Period Average</p>
                    <p className="text-2xl font-bold">
                      ₱{periodAvg.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Highest Expense</p>
                    <p className="text-2xl font-bold">
                      ₱
                      {Math.max(
                        ...chartData.map((d) => d.expenses)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>
                  Latest 10 expenses for this branch
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
