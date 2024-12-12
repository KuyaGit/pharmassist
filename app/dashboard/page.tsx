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
  faChartLine,
  faMoneyBillWave,
  faWarehouse,
  faLightbulb,
  faBoxesStacked,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ComposedChart,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { getMetricTitle, getTimeRangeDescription } from "@/lib/utils";
import { TimeRange } from "@/types/analytics";
import { useCompanyAnalytics } from "@/hooks/useCompanyAnalytics";
import { useBranchTypeStore } from "@/lib/store/branch-type-store";

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
    total_branches: number;
    low_stock_branches: number;
    near_expiry_branches: number;
  };
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const { branchType } = useBranchTypeStore();

  const { analytics, isLoading, error } = useCompanyAnalytics(
    timeRange,
    branchType
  );

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

  const calculatePerformanceInsights = (data: Analytics | null) => {
    if (!data) return null;

    const profitMargin = data.profit_margin;
    const revenuePerBranch = data.total_revenue / data.active_branches;
    const expenseRatio = data.total_expenses / data.total_revenue;

    return {
      profitMargin,
      revenuePerBranch,
      expenseRatio,
      isHealthyMargin: profitMargin > 20,
      isEfficientExpense: expenseRatio < 0.7,
    };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {branchType === "retail" ? "Retail" : "Wholesale"} Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Overall performance metrics for {branchType} operations
              </p>
            </div>
            <div className="flex gap-4">
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
          </div>

          {error ? (
            <div className="text-destructive">{error}</div>
          ) : (
            <>
              {/* Key Metrics Cards */}
              <div className="grid gap-4 md:grid-cols-3">
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
                      Net Profit
                    </CardTitle>
                    <FontAwesomeIcon
                      icon={faChartLine}
                      size="2x"
                      className="text-icon"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ₱{analytics?.net_profit?.toLocaleString() ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      After expenses and taxes
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Profit Margin
                    </CardTitle>
                    <FontAwesomeIcon
                      icon={faStore}
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
                      {branchType} branches
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Low Stock Branches
                    </CardTitle>
                    <FontAwesomeIcon
                      icon={faBoxesStacked}
                      size="2x"
                      className="text-icon"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.inventory?.low_stock_branches ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Branches with low or out of stock items
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Near Expiry Branches
                    </CardTitle>
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      size="2x"
                      className="text-icon"
                    />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics?.inventory?.near_expiry_branches ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Branches with near expiry items
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Charts */}
              <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>
                      {getTimeRangeDescription(timeRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={config}
                      className="h-[400px] w-full"
                    >
                      <ComposedChart
                        data={
                          analytics?.revenue_trend.map((data) => ({
                            month: format(new Date(data.timestamp), "MMM d"),
                            income: data.value,
                            expenses: -Math.abs(data.expenses || 0),
                            profit: data.profit,
                          })) ?? []
                        }
                        margin={{ top: 20, right: 10, left: 10, bottom: 20 }}
                        stackOffset="sign"
                        barGap={0}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis
                          tickFormatter={(value) =>
                            `₱${Math.abs(value / 1000).toFixed(0)}k`
                          }
                        />
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
                          formatter={(value) => (
                            <span style={{ color: "hsl(var(--foreground))" }}>
                              {value}
                            </span>
                          )}
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
                          Performance Insights
                        </span>
                      </div>
                      {(() => {
                        const insights =
                          calculatePerformanceInsights(analytics);
                        if (!insights) return null;

                        return (
                          <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-2">
                            <p>
                              <span className="font-medium">
                                Profit Margin:{" "}
                              </span>
                              {insights.isHealthyMargin ? (
                                <span className="text-green-600 dark:text-green-400">
                                  Healthy margin of{" "}
                                  {insights.profitMargin.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-destructive">
                                  Low margin of{" "}
                                  {insights.profitMargin.toFixed(1)}%. Consider
                                  cost optimization.
                                </span>
                              )}
                            </p>

                            <p>
                              <span className="font-medium">
                                Revenue per Branch:{" "}
                              </span>
                              ₱{insights.revenuePerBranch.toLocaleString()}{" "}
                              average
                            </p>

                            {!insights.isHealthyMargin && (
                              <div className="text-destructive">
                                <span className="font-medium">
                                  ⚠️ Recommendations:
                                </span>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  <li>Review pricing strategy</li>
                                  <li>Optimize operational costs</li>
                                  <li>Analyze underperforming branches</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Top Performing Products</CardTitle>
                    <CardDescription>
                      Best selling products by revenue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.top_products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between space-x-4"
                        >
                          <div className="flex flex-col space-y-1">
                            <span className="font-medium">{product.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                Sales: {product.total_sales.toLocaleString()}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                •
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Revenue: ₱{product.revenue.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              product.profit_margin >= 20
                                ? "default"
                                : "secondary"
                            }
                          >
                            {product.profit_margin.toFixed(1)}% margin
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-7">
                  <CardHeader>
                    <CardTitle>Branch Performance Comparison</CardTitle>
                    <CardDescription>
                      {getTimeRangeDescription(timeRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={config}
                      className="h-[400px] w-full"
                    >
                      <BarChart
                        data={
                          analytics?.branch_performance.map((branch) => ({
                            name: branch.branch_name,
                            revenue: branch.revenue,
                            profit: branch.profit,
                            expenses: branch.total_expenses,
                          })) ?? []
                        }
                        margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
                        barGap={8}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tickMargin={20}
                        />
                        <YAxis
                          tickFormatter={(value) =>
                            `₱${(value / 1000).toFixed(0)}k`
                          }
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-lg border bg-background p-2 shadow-sm">
                                <div className="grid gap-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-medium">
                                      {payload[0].payload.name}
                                    </span>
                                  </div>
                                  <div className="grid gap-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        Revenue:
                                      </span>
                                      <span className="font-medium">
                                        ₱
                                        {Number(
                                          payload[0].value
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        Profit:
                                      </span>
                                      <span className="font-medium">
                                        ₱
                                        {Number(
                                          payload[1].value
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-sm text-muted-foreground">
                                        Expenses:
                                      </span>
                                      <span className="font-medium">
                                        ₱
                                        {Number(
                                          payload[2].value
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Bar
                          dataKey="revenue"
                          fill="hsl(var(--chart-income))"
                          name="Revenue"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="profit"
                          fill="hsl(var(--chart-net-profit))"
                          name="Profit"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="expenses"
                          fill="hsl(var(--chart-expenses))"
                          name="Expenses"
                          radius={[4, 4, 0, 0]}
                        />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          iconType="circle"
                          formatter={(value) => (
                            <span style={{ color: "hsl(var(--foreground))" }}>
                              {value}
                            </span>
                          )}
                        />
                      </BarChart>
                    </ChartContainer>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faLightbulb}
                          className="text-yellow-500"
                        />
                        <span className="font-semibold">Branch Insights</span>
                      </div>
                      {(() => {
                        if (!analytics?.branch_performance.length) return null;

                        const avgRevenue =
                          analytics.branch_performance.reduce(
                            (sum, b) => sum + b.revenue,
                            0
                          ) / analytics.branch_performance.length;

                        const avgProfit =
                          analytics.branch_performance.reduce(
                            (sum, b) => sum + b.profit,
                            0
                          ) / analytics.branch_performance.length;

                        const topBranch = [
                          ...analytics.branch_performance,
                        ].sort((a, b) => b.profit - a.profit)[0];

                        const bottomBranch = [
                          ...analytics.branch_performance,
                        ].sort((a, b) => a.profit - b.profit)[0];

                        const profitSpread = topBranch.profit / avgProfit;

                        return (
                          <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-2">
                            <p>
                              <span className="font-medium">
                                Performance Spread:{" "}
                              </span>
                              {profitSpread > 2 ? (
                                <span className="text-destructive">
                                  High variance in branch performance. Top
                                  branch exceeds average by{" "}
                                  {((profitSpread - 1) * 100).toFixed(1)}%.
                                </span>
                              ) : (
                                <span className="text-green-600 dark:text-green-400">
                                  Balanced performance across branches.
                                </span>
                              )}
                            </p>

                            <p>
                              <span className="font-medium">
                                Top Performer:{" "}
                              </span>
                              {topBranch.branch_name} (₱
                              {topBranch.profit.toLocaleString()} profit)
                            </p>

                            <p>
                              <span className="font-medium">
                                Needs Improvement:{" "}
                              </span>
                              {bottomBranch.branch_name} (₱
                              {bottomBranch.profit.toLocaleString()} profit)
                            </p>

                            {profitSpread > 2 && (
                              <div className="text-destructive">
                                <span className="font-medium">
                                  ⚠️ Recommendations:
                                </span>
                                <ul className="list-disc list-inside ml-4 mt-1">
                                  <li>Analyze top branch practices</li>
                                  <li>
                                    Review underperforming branch operations
                                  </li>
                                  <li>Consider resource reallocation</li>
                                </ul>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {/* Rest of the components... */}
                {/* You can reference the branch and product analytics pages for additional charts and insights */}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
