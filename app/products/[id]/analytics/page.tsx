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
import { cn } from "@/lib/utils";

interface BranchStock {
  id: number;
  name: string;
  stock: number;
  is_available: boolean;
  branch_type: "retail" | "wholesale";
}

export default function ProductDetails() {
  const params = useParams();
  const productId = parseInt(params.id as string);
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
    useProductAnalytics(productId, timeRange);

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
                <p className="text-xs text-muted-foreground">
                  ₱{productData?.total_sales?.revenue?.toLocaleString() ?? 0}{" "}
                  revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Current Price
                </CardTitle>
                <FontAwesomeIcon icon={faTag} size="2x" className="text-icon" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱{productData?.current_price?.srp?.toLocaleString() ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cost: ₱
                  {productData?.current_price?.cost?.toLocaleString() ?? 0}
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
                  {(productData?.price_analytics?.avg_margin ?? 0).toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average profit margin
                </p>
              </CardContent>
            </Card>

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

          <div className="grid gap-4 md:grid-cols-4">
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
                  Branch Stocks
                </CardTitle>
                <FontAwesomeIcon
                  icon={faWarehouse}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div
                  className="space-y-2 overflow-y-auto"
                  style={{ maxHeight: "120px" }}
                >
                  {(() => {
                    const branchStocks = [
                      ...(productData?.stock_analytics?.branch_stocks || []),
                    ];
                    const lowStockBranches = branchStocks.filter(
                      (branch) => branch.is_low_stock
                    );
                    const normalStockBranches = branchStocks.filter(
                      (branch) => !branch.is_low_stock
                    );

                    return (
                      <>
                        {lowStockBranches.length > 0 && (
                          <>
                            <div className="flex items-center gap-2 pb-1">
                              <div className="h-px flex-1 bg-border" />
                              <span className="text-xs font-medium text-destructive">
                                Low Stock Branches
                              </span>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                            {lowStockBranches
                              .sort((a, b) => a.stock - b.stock)
                              .map((branch) => (
                                <div
                                  key={branch.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {branch.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {branch.branch_type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-destructive">
                                      {branch.stock} units
                                    </span>
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      Low
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                          </>
                        )}

                        {normalStockBranches.length > 0 && (
                          <>
                            {lowStockBranches.length > 0 && (
                              <div className="h-px bg-border my-2" />
                            )}
                            <div className="flex items-center gap-2 pb-1">
                              <div className="h-px flex-1 bg-border" />
                              <span className="text-xs font-medium text-muted-foreground">
                                Normal Stock Branches
                              </span>
                              <div className="h-px flex-1 bg-border" />
                            </div>
                            {normalStockBranches
                              .sort((a, b) => b.stock - a.stock)
                              .map((branch) => (
                                <div
                                  key={branch.id}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {branch.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {branch.branch_type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      {branch.stock} units
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Retail Inventory Alert
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
                      Status
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
                      Alert Threshold
                    </span>
                    <span className="text-xl font-bold">
                      {product?.retail_low_stock_threshold ?? 0} units
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Wholesale Inventory Alert
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
                      Status
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
                      Alert Threshold
                    </span>
                    <span className="text-xl font-bold">
                      {product?.wholesale_low_stock_threshold ?? 0} units
                    </span>
                  </div>
                </div>
              </CardContent>
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
                    data={branchPerformance}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="branch_name" type="category" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="quantity"
                      fill={chartConfig.sales.color}
                      name="Units Sold"
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Top performing branch: {branchPerformance[0]?.branch_name}
                  </p>
                  <p>Total branches selling: {branchPerformance.length}</p>
                </div>
              </CardFooter>
            </Card>
          </div>
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
