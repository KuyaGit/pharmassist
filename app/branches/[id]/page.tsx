"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { InventoryReport } from "@/types/inventory";
import {
  Card,
  CardContent,
  CardDescription,
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
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";

import { Icons } from "@/components/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxes,
  faStore,
  faExclamationTriangle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";

interface Branch {
  id: number;
  branch_name: string;
  location: string;
  is_active: boolean;
  branch_type: string;
}

interface BranchProduct {
  id: string;
  product_id: number;
  branch_id: number;
  quantity: number;
  peso_value: number;
  current_expiration_date: string;
  is_low_stock: boolean;
  active_quantity: number;
  is_available: boolean;
  branch_type: string;
  is_retail_available: boolean;
  is_wholesale_available: boolean;
  retail_low_stock_threshold: number;
  wholesale_low_stock_threshold: number;
  product_name: string;
}

export default function BranchDetails() {
  const params = useParams();
  const router = useRouter();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [branchProducts, setBranchProducts] = useState<BranchProduct[]>([]);
  const [inventoryReports, setInventoryReports] = useState<InventoryReport[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  const columns: ColumnDef<BranchProduct>[] = [
    {
      accessorKey: "product_name",
      header: "Product Name",
    },
    {
      accessorKey: "active_quantity",
      header: "Stock Level",
      cell: ({ row }) => {
        const quantity = row.original.active_quantity;
        const isLowStock = row.original.is_low_stock;
        const isAvailable = row.original.is_available;
        const branchType = row.original.branch_type;
        const retailThreshold = row.original.retail_low_stock_threshold;
        const wholesaleThreshold = row.original.wholesale_low_stock_threshold;

        const threshold =
          branchType === "wholesale" ? wholesaleThreshold : retailThreshold;

        let textColorClass = "text-green-600 dark:text-green-400";

        if (!isAvailable) {
          textColorClass = "text-muted-foreground";
        } else if (isLowStock) {
          textColorClass = "text-red-600 dark:text-red-400";
        }

        return (
          <div className="flex items-center gap-2">
            <div className={`font-medium ${textColorClass}`}>{quantity}</div>
            <div className="text-muted-foreground text-sm">/ {threshold}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "current_expiration_date",
      header: "Expiry Date",
      cell: ({ row }) => {
        const date = new Date(
          row.getValue("current_expiration_date") as string
        );
        const today = new Date();
        const thirtyDaysFromNow = new Date(
          today.getTime() + 30 * 24 * 60 * 60 * 1000
        );

        const textColorClass =
          date <= thirtyDaysFromNow
            ? "text-red-600 dark:text-red-400"
            : "text-muted-foreground";

        return (
          <div className={`font-medium ${textColorClass}`}>
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      accessorKey: "is_available",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_available") ? "success" : "secondary"}>
          {row.getValue("is_available") ? "Available" : "Unavailable"}
        </Badge>
      ),
    },
  ];

  const reportColumns: ColumnDef<InventoryReport>[] = [
    {
      accessorKey: "id",
      header: "Report ID",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        try {
          const date = new Date(row.getValue("created_at"));
          const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
          const restOfDate = date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return (
            <div className="flex items-center gap-1">
              <span className="font-bold">{weekday}</span>
              <span>,</span>
              <span>{restOfDate}</span>
            </div>
          );
        } catch {
          return "Invalid Date";
        }
      },
    },
    {
      id: "period",
      header: "Period",
      cell: ({ row }) => {
        try {
          const start = new Date(row.original.start_date);
          const end = new Date(row.original.end_date);

          if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return "Invalid Date Range";
          }

          const formatDate = (date: Date) => {
            const weekday = date.toLocaleDateString("en-US", {
              weekday: "long",
            });
            const restOfDate = date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
            return (
              <div className="flex items-center gap-1">
                <span className="font-bold">{weekday}</span>
                <span>,</span>
                <span>{restOfDate}</span>
              </div>
            );
          };

          return (
            <div className="flex items-center gap-2">
              {formatDate(start)}
              <span>-</span>
              {formatDate(end)}
            </div>
          );
        } catch {
          return "Invalid Date Range";
        }
      },
    },
    {
      accessorKey: "items_count",
      header: "Items Count",
    },
  ];

  const handleRowClick = (row: InventoryReport) => {
    router.push(`/reports/${row.id}`);
  };

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const [branchResponse, productsResponse, reportsResponse] =
          await Promise.all([
            fetch(
              `${API_BASE_URL}${API_ENDPOINTS.BRANCHES.GET(Number(params.id))}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(
              `${API_BASE_URL}${API_ENDPOINTS.BRANCH_PRODUCTS.LIST}?branch_id=${params.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
            fetch(
              `${API_BASE_URL}${API_ENDPOINTS.INVENTORY.BRANCH(
                Number(params.id)
              )}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);

        if (!branchResponse.ok || !productsResponse.ok || !reportsResponse.ok) {
          throw new Error("Failed to fetch branch details");
        }

        const [branchData, productsData, reportsData] = await Promise.all([
          branchResponse.json(),
          productsResponse.json(),
          reportsResponse.json(),
        ]);

        setBranch(branchData);
        setBranchProducts(productsData);
        setInventoryReports(reportsData);
      } catch (error) {
        console.error("Error fetching branch details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranchDetails();
  }, [params.id]);

  if (!branch) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {branch.branch_name}
              </h1>
              <p className="text-muted-foreground">
                {branch.branch_type.charAt(0).toUpperCase() +
                  branch.branch_type.slice(1)}{" "}
                Branch • {branch.location}
              </p>
            </div>
            <Badge
              variant={branch.is_active ? "success" : "secondary"}
              className="text-sm"
            >
              {branch.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/branches">Branches</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{branch.branch_name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
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
                  {branchProducts.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Products in this branch
                </p>
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
                  {branchProducts.filter((item) => item.is_low_stock).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items below threshold
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
                    branchProducts.filter(
                      (item) =>
                        new Date(item.current_expiration_date) <=
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Expiring within 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Branch Products</CardTitle>
              <CardDescription>
                Inventory status for {branch.branch_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={branchProducts}
                enableFiltering
                enableSorting
                enableColumnVisibility
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
              <CardDescription>
                Recent inventory reports for {branch.branch_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={reportColumns}
                data={inventoryReports}
                enableFiltering
                enableSorting
                enableColumnVisibility
                onRowClick={handleRowClick}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
