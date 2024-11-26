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
  faMoneyBillWave,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedBranch, setEditedBranch] = useState<Branch | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        const dateValue = row.getValue("current_expiration_date") as
          | string
          | null;

        if (!dateValue) {
          return <div className="font-medium text-muted-foreground">-</div>;
        }

        const date = new Date(dateValue);
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
      accessorFn: (row) => {
        const date = new Date(row.created_at);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
      filterFn: (row, id, filterValue) => {
        const date = new Date(row.getValue(id));
        const searchableDate = date
          .toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
          .toLowerCase();
        return searchableDate.includes(filterValue.toLowerCase());
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
    {
      accessorKey: "is_viewed",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_viewed") ? "secondary" : "success"}>
          {row.getValue("is_viewed") ? "Viewed" : "New"}
        </Badge>
      ),
    },
  ];

  const handleRowClick = (row: InventoryReport) => {
    router.push(`/reports/${row.id}`);
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedBranch) return;

    setIsSubmitting(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BRANCHES.UPDATE(editedBranch.id)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedBranch),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update branch");
      }

      const updatedBranch = await response.json();
      setBranch(updatedBranch);
      setIsEditDialogOpen(false);
      toast.success("Branch updated successfully");
    } catch (error) {
      console.error("Error updating branch:", error);
      toast.error("Failed to update branch");
    } finally {
      setIsSubmitting(false);
    }
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

  useEffect(() => {
    if (isEditDialogOpen && branch) {
      setEditedBranch(branch);
    }
  }, [isEditDialogOpen, branch]);

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
            <Button
              size="sm"
              className="gap-2"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit Branch Details
            </Button>
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
                  {
                    branchProducts.filter((product) => product.is_available)
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Active products in this branch
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
                        item.current_expiration_date &&
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

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <FontAwesomeIcon
                  icon={faMoneyBillWave}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(
                    branchProducts.reduce(
                      (sum, product) => sum + product.peso_value,
                      0
                    )
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total inventory value
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
                data={[...branchProducts].sort((a, b) => {
                  // First sort by availability
                  if (a.is_available && !b.is_available) return -1;
                  if (!a.is_available && b.is_available) return 1;

                  // Then sort alphabetically within each group
                  return a.product_name.localeCompare(b.product_name);
                })}
                enableFiltering
                enableSorting
                enableColumnVisibility
                filterColumn={["product_name"]}
                filterPlaceholder="Search by product name..."
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
                filterColumn={["id", "created_at"]}
                filterPlaceholder="Search by report ID or creation date..."
              />
            </CardContent>
          </Card>
        </main>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleUpdateBranch}>
            <DialogHeader>
              <DialogTitle>Edit Branch</DialogTitle>
              <DialogDescription>
                Make changes to the branch details here. Click save when you're
                done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="branch_name" className="text-right">
                  Name
                </Label>
                <Input
                  id="branch_name"
                  value={editedBranch?.branch_name || ""}
                  onChange={(e) =>
                    setEditedBranch((prev) =>
                      prev
                        ? {
                            ...prev,
                            branch_name: e.target.value,
                          }
                        : null
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={editedBranch?.location || ""}
                  onChange={(e) =>
                    setEditedBranch((prev) =>
                      prev
                        ? {
                            ...prev,
                            location: e.target.value,
                          }
                        : null
                    )
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editedBranch?.is_active ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setEditedBranch((prev) =>
                      prev
                        ? {
                            ...prev,
                            is_active: value === "active",
                          }
                        : null
                    )
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
