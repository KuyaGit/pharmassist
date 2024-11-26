"use client";

import { useState, useEffect } from "react";
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
import { TrendingUp } from "lucide-react";
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
import { BranchInventory, BranchReport } from "@/types/branch";

export default function BranchDetails() {
  const params = useParams();
  const branchId = parseInt(params.id as string);
  const {
    branch,
    inventory: branchInventory,
    reports: branchReports,
    salesData,
    categorySales,
    isLoading,
    error,
  } = useBranchDetails(branchId);

  const inventoryColumns: ColumnDef<BranchInventory>[] = [
    { accessorKey: "product_name", header: "Product Name" },
    { accessorKey: "stock_level", header: "Stock Level" },
    { accessorKey: "expiry_date", header: "Expiry Date" },
  ];

  const reportColumns: ColumnDef<BranchReport>[] = [
    { accessorKey: "id", header: "Report ID" },
    { accessorKey: "date_created", header: "Date Created" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "approved" ? "success" : "secondary"}
            className={cn(
              status === "pending" && "bg-yellow-500 hover:bg-yellow-600"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
  ];

  const totalSales = salesData.reduce((sum, data) => sum + data.sales, 0);
  const totalProfit = salesData.reduce((sum, data) => sum + data.profit, 0);
  const grossProfit = totalSales * 0.3; // Assuming 30% gross profit margin
  const netProfit = totalProfit;

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--chart-1))",
    },
    profit: {
      label: "Profit",
      color: "hsl(var(--chart-2))",
    },
    Prescription: {
      label: "Prescription",
      color: "hsl(var(--chart-1))",
    },
    OTC: {
      label: "OTC",
      color: "hsl(var(--chart-2))",
    },
    "Personal Care": {
      label: "Personal Care",
      color: "hsl(var(--chart-3))",
    },
    Supplements: {
      label: "Supplements",
      color: "hsl(var(--chart-4))",
    },
    Other: {
      label: "Other",
      color: "hsl(var(--chart-5))",
    },
  } satisfies ChartConfig;

  if (error || !branch) {
    return <div>Error loading branch details</div>; // We'll improve this error state later
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{branch.name}</h1>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/branches">Branches</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{branch.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold">
                  Total Products
                </CardTitle>
                <FontAwesomeIcon
                  icon={faBoxes}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {branchInventory.length}
                </div>
                <p className="text-xs text-muted-foreground">In this branch</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Items
                </CardTitle>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    branchInventory.filter((item) => item.stock_level < 50)
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Items with stock below 50
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Near Expiry Items
                </CardTitle>
                <FontAwesomeIcon
                  icon={faClock}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    branchInventory.filter(
                      (item) =>
                        item.expiry_date &&
                        new Date(item.expiry_date) <=
                          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Expiring within 30 days
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Reports
                </CardTitle>
                <FontAwesomeIcon
                  icon={faClipboardList}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{branchReports.length}</div>
                <p className="text-xs text-muted-foreground">
                  Inventory reports for this branch
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
                  icon={faDollarSign}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalSales.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Gross Profit
                </CardTitle>
                <FontAwesomeIcon
                  icon={faChartLine}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${grossProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
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
                  ${netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Last 6 months</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Sales and Profit Trend</CardTitle>
                <CardDescription>Last 6 months performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    data={salesData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
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
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="var(--color-profit)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 font-medium leading-none">
                      Trending up by 5.2% this month{" "}
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 leading-none text-muted-foreground">
                      Showing sales and profit for the last 6 months
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card className="col-span-2 flex flex-col md:col-span-1">
              <CardHeader className="items-center pb-0">
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Current Month</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <PieChart>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={categorySales}
                      dataKey="value"
                      nameKey="name"
                      startAngle={90}
                      endAngle={-270}
                    >
                      {categorySales.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            chartConfig[entry.name as keyof typeof chartConfig]
                              .color
                          }
                        />
                      ))}
                    </Pie>
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Highest category: {categorySales[0].name} (
                  {(
                    (categorySales[0].value /
                      categorySales.reduce(
                        (sum, item) => sum + item.value,
                        0
                      )) *
                    100
                  ).toFixed(1)}
                  %)
                </div>
                <div className="leading-none text-muted-foreground">
                  Showing sales distribution for the current month
                </div>
              </CardFooter>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Branch Inventory</CardTitle>
              <CardDescription>
                List of all products in this branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={inventoryColumns}
                data={branchInventory}
                filterColumn="product_name"
              />
            </CardContent>
          </Card>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Branch Reports</CardTitle>
              <CardDescription>
                Inventory reports for this branch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={reportColumns}
                data={branchReports}
                filterColumn="id"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
