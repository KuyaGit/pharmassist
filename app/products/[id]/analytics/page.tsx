"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Pencil, ShieldCheck, ShieldX } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  faChartLine,
  faTag,
  faMoneyBillWave,
  faWarehouse,
  faChartBar,
  faExclamationTriangle,
  faMoneyBill,
  faBoxes,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TimeRange } from "@/types/analytics";
import { getCookie } from "cookies-next";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { Badge } from "@/components/ui/badge";
import { EditProductDialog } from "@/components/EditProductDialog";
import { CheckCircle2Icon, XCircleIcon, AlertCircleIcon } from "lucide-react";
import { Product } from "@/types/products";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useProductAnalytics } from "@/hooks/useProductAnalytics";
import { updateProduct } from "@/lib/api-utils";
import { cn, getTimeRangeDescription } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { useBranchTypeStore } from "@/lib/store/branch-type-store";

interface BranchStock {
  id: number;
  name: string;
  stock: number;
  is_available: boolean;
  branch_type: "retail" | "wholesale";
  is_low_stock: boolean;
  low_stock_since: string | null;
  days_in_low_stock: number;
}

interface BranchPerformanceWithStock extends BranchStock {
  quantity: number;
  revenue: number;
}

interface EditProductForm {
  name: string;
  cost: number;
  srp: number;
  is_retail_available: boolean;
  is_wholesale_available: boolean;
  retail_low_stock_threshold: number;
  wholesale_low_stock_threshold: number;
}

interface BranchPerformanceData {
  branch_name: string;
  quantity: number;
  revenue: number;
}

const combinedColumns: ColumnDef<BranchPerformanceWithStock>[] = [
  {
    accessorKey: "name",
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Branch Name" align="left" />
    ),
    cell: ({ row }) => <div>{row.getValue("name")}</div>,
  },
  {
    accessorKey: "branch_type",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" align="left" />
    ),
    cell: ({ row }) => (
      <div>
        <Badge variant="outline" className="capitalize">
          {row.getValue("branch_type")}
        </Badge>
      </div>
    ),
  },
  {
    accessorKey: "stock",
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Current Stock"
        align="left"
      />
    ),
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      const isLowStock = row.original.is_low_stock;
      const daysInLowStock = row.original.days_in_low_stock;

      let textColorClass = "text-green-600 dark:text-green-400";

      if (!row.original.is_available) {
        textColorClass = "text-muted-foreground";
      } else if (isLowStock) {
        textColorClass = "text-red-600 dark:text-red-400";
      }

      return (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={`font-medium ${textColorClass}`}>{stock} units</div>
            {isLowStock && (
              <Badge variant="destructive" className="text-xs">
                Low
              </Badge>
            )}
          </div>
          {isLowStock && daysInLowStock >= 0 && (
            <div className="text-xs text-destructive font-medium">
              {daysInLowStock === 0
                ? "Low stock since today"
                : `Low stock for ${daysInLowStock} days`}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Units Sold" align="left" />
    ),
    cell: ({ row }) => {
      const quantity = row.getValue("quantity") as number;
      return <div>{quantity?.toLocaleString() ?? 0} units</div>;
    },
  },
  {
    accessorKey: "revenue",
    enableSorting: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Revenue" align="right" />
    ),
    cell: ({ row }) => {
      const revenue = row.getValue("revenue") as number;
      const isRetail = row.original.branch_type === "retail";

      if (!isRetail) {
        return <div className="text-right">Variable pricing</div>;
      }

      return (
        <div className="text-right">₱{revenue?.toLocaleString() ?? 0}</div>
      );
    },
  },
  {
    accessorKey: "is_available",
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" align="right" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <Badge variant={row.getValue("is_available") ? "success" : "secondary"}>
          {row.getValue("is_available") ? "Available" : "Unavailable"}
        </Badge>
      </div>
    ),
  },
];

const calculateGrowthRate = (
  currentData: number,
  timeRange: TimeRange,
  productData: any
) => {
  if (!currentData) return "0.0";

  const previousData = productData?.previous_sales?.quantity ?? 0;
  if (previousData === 0) return "0.0";

  const growthRate = ((currentData - previousData) / previousData) * 100;
  return growthRate.toFixed(1);
};

const calculateTurnoverRate = (
  currentStock: number,
  totalSold: number,
  timeRange: TimeRange
) => {
  if (!currentStock) return "0.0";

  let annualizationFactor: number;
  switch (timeRange) {
    case "7d":
      annualizationFactor = 365 / 7;
      break;
    case "30d":
      annualizationFactor = 365 / 30;
      break;
    case "90d":
      annualizationFactor = 365 / 90;
      break;
    case "1y":
      annualizationFactor = 1;
      break;
    default:
      annualizationFactor = 365 / 30;
  }

  const annualizedSales = totalSold * annualizationFactor;
  return (annualizedSales / currentStock).toFixed(1);
};

export default function ProductDetails() {
  const params = useParams();
  const productId = parseInt(params.id as string);
  const { branchType } = useBranchTypeStore();
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProductDetails = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.GET(productId)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch product details");
      const data = await response.json();
      setProduct(data);
      setSelectedProduct(data);
    } catch (err) {
      console.error("Error fetching product details:", err);
      showToast("Failed to fetch product details", "error");
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const { productData, priceHistory, branchPerformance, refetch } =
    useProductAnalytics(productId, timeRange, branchType);

  const chartConfig = {
    sales: {
      label: "Sales",
      color: "hsl(var(--primary))",
    },
    cost: {
      label: "Cost",
      color: "hsl(var(--destructive))",
    },
    srp: {
      label: "SRP",
      color: "hsl(var(--success))",
    },
  };

  const handleEdit = () => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsLoading(true);
    try {
      await updateProduct(selectedProduct.id, selectedProduct);
      await fetchProductDetails();
      await refetch();
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      showToast("Product updated successfully", "success");
    } catch (error) {
      showToast("Failed to update product", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    const styles = {
      success: {
        icon: (
          <div className="rounded-full bg-green-500">
            <CheckCircle2Icon className="h-5 w-5 text-white" />
          </div>
        ),
        className:
          "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 font-medium",
      },
      error: {
        icon: (
          <div className="rounded-full bg-red-500">
            <XCircleIcon className="h-5 w-5 text-white" />
          </div>
        ),
        className:
          "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-medium",
      },
      warning: {
        icon: (
          <div className="rounded-full bg-yellow-500">
            <AlertCircleIcon className="h-5 w-5 text-white" />
          </div>
        ),
        className:
          "bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400 font-medium",
      },
    };

    toast(message, {
      icon: styles[type].icon,
      className: styles[type].className,
      duration: 3000,
    });
  };

  // Modify the filtering to combine branch performance and stock data
  const filteredBranchPerformance: BranchPerformanceWithStock[] =
    productData?.stock_analytics?.branch_stocks
      ?.filter((stock: BranchStock) => stock.branch_type === branchType)
      ?.map((stock: BranchStock) => {
        const performance = branchPerformance?.find(
          (branch: BranchPerformanceData) => branch.branch_name === stock.name
        );

        return {
          ...stock,
          quantity: performance?.quantity ?? 0,
          revenue: performance?.revenue ?? 0,
        };
      }) ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  {product?.name || "Loading..."}
                </h1>

                <div className="flex gap-2 mt-1">
                  {product?.is_retail_available && (
                    <Badge variant="outline">Retail</Badge>
                  )}
                  {product?.is_wholesale_available && (
                    <Badge variant="outline">Wholesale</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
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
              <Button variant="outline" onClick={() => router.back()}>
                Back
              </Button>
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Details
              </Button>
            </div>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/products">Products</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Analytics</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Sales
                </CardTitle>
                <FontAwesomeIcon
                  icon={faMoneyBillWave}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productData?.total_sales?.quantity ?? 0} units
                </div>
                {branchType === "retail" ? (
                  <p className="text-xs text-muted-foreground">
                    ₱{productData?.total_sales?.revenue?.toLocaleString() ?? 0}{" "}
                    revenue
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Revenue varies (wholesale pricing)
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {product?.is_retail_available &&
                  product?.is_wholesale_available
                    ? "Retail Price"
                    : product?.is_retail_available
                    ? "Retail Price"
                    : "Base Price"}
                </CardTitle>
                <FontAwesomeIcon
                  icon={faMoneyBill}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                {product?.is_retail_available ? (
                  <>
                    <div className="text-2xl font-bold">
                      ₱{product?.srp?.toLocaleString() ?? 0}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        Cost: ₱{product?.cost?.toLocaleString() ?? 0}
                      </p>
                      <Badge variant="outline" className="text-success">
                        {(
                          (((product?.srp ?? 0) - (product?.cost ?? 0)) /
                            (product?.cost ?? 1)) *
                          100
                        ).toFixed(2)}
                        % retail margin
                      </Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      ₱{product?.cost?.toLocaleString() ?? 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Base cost for wholesale pricing
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {branchType === "retail" ? (
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
                    {(productData?.price_analytics?.avg_margin ?? 0).toFixed(2)}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average retail profit margin
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Stock Turnover Rate
                  </CardTitle>
                  <FontAwesomeIcon
                    icon={faChartLine}
                    size="2x"
                    className="text-icon"
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {calculateTurnoverRate(
                      productData?.stock_analytics?.total_stock ?? 0,
                      productData?.total_sales?.quantity ?? 0,
                      timeRange
                    )}
                    x
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Annualized turnover rate for{" "}
                    {getTimeRangeDescription(timeRange)}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Price Changes
                </CardTitle>
                <FontAwesomeIcon icon={faTag} size="2x" className="text-icon" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productData?.price_analytics?.change_count ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total price adjustments
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Stock Distribution
                </CardTitle>
                <FontAwesomeIcon
                  icon={faWarehouse}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {productData?.stock_analytics?.total_stock ?? 0} units
                </div>
                <p className="text-xs text-muted-foreground">
                  Total stock across all branches
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  Available in {productData?.stock_analytics?.branch_count ?? 0}{" "}
                  branches
                </div>
                <Badge
                  variant={
                    productData?.stock_analytics?.low_stock_branches > 0
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {productData?.stock_analytics?.low_stock_branches ?? 0} low
                  stock
                </Badge>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Retail Stock Alert Settings
                </CardTitle>
                {product?.is_retail_available ? (
                  <ShieldCheck className="h-6 w-6 text-success" />
                ) : (
                  <ShieldX className="h-6 w-6 text-destructive" />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Retail Availability
                    </span>
                    <Badge
                      variant={
                        product?.is_retail_available ? "success" : "secondary"
                      }
                    >
                      {product?.is_retail_available
                        ? "Available"
                        : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Low Stock Alert At
                    </span>
                    <span className="text-xl font-bold">
                      {product?.retail_low_stock_threshold ?? 0} units
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Branches will be flagged when retail stock falls below this
                  threshold
                </p>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Wholesale Stock Alert Settings
                </CardTitle>
                {product?.is_wholesale_available ? (
                  <ShieldCheck className="h-6 w-6 text-success" />
                ) : (
                  <ShieldX className="h-6 w-6 text-destructive" />
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Wholesale Availability
                    </span>
                    <Badge
                      variant={
                        product?.is_wholesale_available
                          ? "success"
                          : "secondary"
                      }
                    >
                      {product?.is_wholesale_available
                        ? "Available"
                        : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Low Stock Alert At
                    </span>
                    <span className="text-xl font-bold">
                      {product?.wholesale_low_stock_threshold ?? 0} units
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  Branches will be flagged when wholesale stock falls below this
                  threshold
                </p>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Price History</CardTitle>
                <CardDescription>
                  Cost and SRP changes over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    data={priceHistory}
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
                          year: "numeric",
                        });
                      }}
                    />
                    <YAxis />
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          let formattedDate;
                          try {
                            formattedDate = format(
                              new Date(label),
                              "MMM d, yyyy"
                            );
                          } catch (error) {
                            formattedDate = label;
                          }

                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Date
                                  </span>
                                  <span className="font-bold">
                                    {formattedDate}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  {payload.map((entry) => (
                                    <div
                                      key={entry.name}
                                      className="flex flex-col"
                                      style={{
                                        color:
                                          (entry.dataKey &&
                                            chartConfig[
                                              entry.dataKey as keyof typeof chartConfig
                                            ]?.color) ||
                                          undefined,
                                      }}
                                    >
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        {entry.name}
                                      </span>
                                      <span className="font-bold">
                                        ₱
                                        {entry.value?.toLocaleString() ?? "N/A"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="cost"
                      stroke={chartConfig.cost.color}
                      name="Cost"
                    />
                    <Line
                      type="stepAfter"
                      dataKey="srp"
                      stroke={chartConfig.srp.color}
                      name="SRP"
                    />
                    <Legend />
                  </LineChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="text-yellow-500"
                    />
                    <span className="font-semibold">
                      Price History Insights
                    </span>
                  </div>
                  {(() => {
                    const latestPrice =
                      priceHistory[priceHistory.length - 1]?.srp ?? 0;

                    // Get price from 6 months ago as baseline
                    const sixMonthsAgo = new Date();
                    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                    const baselinePrice =
                      priceHistory.reduce(
                        (
                          baseline: { date: string; srp: number } | null,
                          record: { date: string; srp: number }
                        ) => {
                          const recordDate = new Date(record.date);
                          // Find the closest price to 6 months ago
                          if (
                            recordDate <= sixMonthsAgo &&
                            (!baseline || recordDate > new Date(baseline.date))
                          ) {
                            return record;
                          }
                          return baseline;
                        },
                        null
                      )?.srp ??
                      priceHistory[0]?.srp ??
                      latestPrice;

                    const priceChangePercent =
                      ((latestPrice - baselinePrice) / baselinePrice) * 100;
                    const marginTrend =
                      productData?.price_analytics?.avg_margin ?? 0;

                    return (
                      <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-2">
                        <p>
                          <span className="font-medium">
                            6-Month Price Trend:{" "}
                          </span>
                          {Math.abs(priceChangePercent) > 15 ? ( // Reduced threshold for 6-month period
                            <span className="text-destructive">
                              Significant price{" "}
                              {priceChangePercent > 0 ? "increase" : "decrease"}{" "}
                              of {Math.abs(priceChangePercent).toFixed(1)}% in
                              the past 6 months.
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">
                              Stable pricing with{" "}
                              {priceChangePercent > 0
                                ? "slight increase"
                                : "slight decrease"}{" "}
                              of {Math.abs(priceChangePercent).toFixed(1)}% in
                              the past 6 months.
                            </span>
                          )}
                        </p>

                        <p>
                          <span className="font-medium">Margin Analysis: </span>
                          {marginTrend < 15 ? (
                            <span className="text-destructive">
                              Low profit margin of {marginTrend.toFixed(1)}%.
                              Consider cost optimization.
                            </span>
                          ) : marginTrend > 40 ? (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              High margin of {marginTrend.toFixed(1)}%. Monitor
                              market competitiveness.
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">
                              Healthy margin of {marginTrend.toFixed(1)}%.
                            </span>
                          )}
                        </p>

                        {(Math.abs(priceChangePercent) > 20 ||
                          marginTrend < 15 ||
                          marginTrend > 40) && (
                          <div className="text-destructive">
                            <span className="font-medium">
                              ⚠️ Recommendations:
                            </span>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Review competitor pricing strategies</li>
                              <li>
                                Analyze sales volume impact of price changes
                              </li>
                              <li>
                                Consider bulk purchase opportunities for better
                                margins
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Average margin:{" "}
                    {(productData?.price_analytics?.avg_margin ?? 0).toFixed(2)}
                    %
                  </p>
                  <p>
                    Price changes: {productData?.price_analytics?.change_count}{" "}
                    times
                  </p>
                </div>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Branch Performance</CardTitle>
                <CardDescription>Sales by branch</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <BarChart
                    data={filteredBranchPerformance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    barSize={20}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={50}
                      tickFormatter={(value) =>
                        value.length > 15
                          ? `${value.substring(0, 15)}...`
                          : value
                      }
                    />
                    <ChartTooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="quantity"
                      fill={chartConfig.sales.color}
                      name="Units Sold"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faLightbulb}
                      className="text-yellow-500"
                    />
                    <span className="font-semibold">Distribution Insights</span>
                  </div>
                  {(() => {
                    const totalBranches = filteredBranchPerformance.length;
                    const totalSales = filteredBranchPerformance.reduce(
                      (sum, b) => sum + b.quantity,
                      0
                    );
                    const avgSales = totalSales / totalBranches;
                    const topPerformer = filteredBranchPerformance[0];
                    const salesSpread = topPerformer
                      ? topPerformer.quantity / avgSales
                      : 0;

                    return (
                      <div className="rounded-lg border bg-muted/50 p-3 text-sm space-y-2">
                        <p>
                          <span className="font-medium">
                            Distribution Coverage:{" "}
                          </span>
                          {totalBranches < 3 ? (
                            <span className="text-yellow-600 dark:text-yellow-400">
                              Limited availability in only {totalBranches}{" "}
                              branches. Consider expanding distribution.
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">
                              Good market coverage across {totalBranches}{" "}
                              branches.
                            </span>
                          )}
                        </p>

                        <p>
                          <span className="font-medium">
                            Sales Distribution:{" "}
                          </span>
                          {salesSpread > 3 ? (
                            <span className="text-destructive">
                              High sales variance with top branch exceeding
                              average by {((salesSpread - 1) * 100).toFixed(1)}
                              %.
                            </span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">
                              Balanced sales distribution across branches.
                            </span>
                          )}
                        </p>

                        {(totalBranches < 3 || salesSpread > 3) && (
                          <div className="text-destructive">
                            <span className="font-medium">
                              ⚠️ Recommendations:
                            </span>
                            <ul className="list-disc list-inside ml-4 mt-1">
                              <li>Evaluate stock allocation strategy</li>
                              <li>Consider expanding to new branches</li>
                              <li>Analyze successful branch practices</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Top performing branch: {filteredBranchPerformance[0]?.name}
                  </p>
                  <p>
                    Total branches selling: {filteredBranchPerformance.length}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Branch Performance & Stock</CardTitle>
              <CardDescription>Combined branch analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={combinedColumns}
                data={filteredBranchPerformance}
                enableSorting
                enableFiltering
                enableColumnVisibility
                filterColumn="name"
                filterPlaceholder="Search branches..."
              />
            </CardContent>
          </Card>
        </main>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>
                Make changes to the product here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  className="col-span-3"
                  value={selectedProduct?.name || ""}
                  onChange={(e) =>
                    setSelectedProduct(
                      selectedProduct
                        ? { ...selectedProduct, name: e.target.value }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cost" className="text-right">
                  Cost
                </Label>
                <Input
                  id="edit-cost"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  value={selectedProduct?.cost || 0}
                  onChange={(e) =>
                    setSelectedProduct(
                      selectedProduct
                        ? {
                            ...selectedProduct,
                            cost: parseFloat(e.target.value),
                          }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-srp" className="text-right">
                  SRP
                </Label>
                <Input
                  id="edit-srp"
                  type="number"
                  step="0.01"
                  className="col-span-3"
                  value={selectedProduct?.srp || 0}
                  onChange={(e) =>
                    setSelectedProduct(
                      selectedProduct
                        ? {
                            ...selectedProduct,
                            srp: parseFloat(e.target.value),
                          }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-retail-threshold" className="text-right">
                  Retail Threshold
                </Label>
                <Input
                  id="edit-retail-threshold"
                  type="number"
                  className="col-span-3"
                  value={selectedProduct?.retail_low_stock_threshold || 0}
                  onChange={(e) =>
                    setSelectedProduct(
                      selectedProduct
                        ? {
                            ...selectedProduct,
                            retail_low_stock_threshold: parseInt(
                              e.target.value
                            ),
                          }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label
                  htmlFor="edit-wholesale-threshold"
                  className="text-right"
                >
                  Wholesale Threshold
                </Label>
                <Input
                  id="edit-wholesale-threshold"
                  type="number"
                  className="col-span-3"
                  value={selectedProduct?.wholesale_low_stock_threshold || 0}
                  onChange={(e) =>
                    setSelectedProduct(
                      selectedProduct
                        ? {
                            ...selectedProduct,
                            wholesale_low_stock_threshold: parseInt(
                              e.target.value
                            ),
                          }
                        : null
                    )
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Availability</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-retail"
                      checked={selectedProduct?.is_retail_available || false}
                      onCheckedChange={(checked) =>
                        setSelectedProduct(
                          selectedProduct
                            ? {
                                ...selectedProduct,
                                is_retail_available: checked as boolean,
                              }
                            : null
                        )
                      }
                    />
                    <Label htmlFor="edit-retail">Retail Available</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-wholesale"
                      checked={selectedProduct?.is_wholesale_available || false}
                      onCheckedChange={(checked) =>
                        setSelectedProduct(
                          selectedProduct
                            ? {
                                ...selectedProduct,
                                is_wholesale_available: checked as boolean,
                              }
                            : null
                        )
                      }
                    />
                    <Label htmlFor="edit-wholesale">Wholesale Available</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
