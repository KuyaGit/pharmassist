"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import { InventoryReport } from "@/types/inventory";
import { Button } from "@/components/ui/button";
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
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faCheckCircle,
  faExclamationTriangle,
  faCalendarAlt,
  faBoxes,
  faMoneyBillWave,
  faStore,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { formatCurrency } from "@/lib/utils";
import { useBranchTypeStore } from "@/lib/store/branch-type-store";

export default function InventoryReports() {
  const router = useRouter();
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const branchType = useBranchTypeStore((state) => state.branchType);
  const [user] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );

  const fetchReports = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) throw new Error("No auth token");

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.INVENTORY.LIST}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }
      );

      if (!response.ok) throw new Error("Failed to fetch reports");

      const data = await response.json();
      const filteredReports = data.map((report: InventoryReport) => ({
        ...report,
        isUnviewed: report.viewed_by === null,
      }));
      setReports(filteredReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user.id, branchType]);

  const columns: ColumnDef<InventoryReport>[] = [
    {
      accessorKey: "id",
      header: "Report ID",
    },
    {
      accessorKey: "branch_name",
      header: "Branch",
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      id: "period",
      header: "Period",
      cell: ({ row }) => {
        const start = new Date(row.original.start_date);
        const end = new Date(row.original.end_date);
        return (
          <div className="flex items-center gap-2">
            <span>{start.toLocaleDateString()}</span>
            <span>-</span>
            <span>{end.toLocaleDateString()}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "items_count",
      header: "Items",
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <Badge variant={report.isUnviewed ? "success" : "secondary"}>
            {report.isUnviewed ? "New" : "Viewed"}
          </Badge>
        );
      },
    },
  ];

  const handleRowClick = async (row: InventoryReport) => {
    if (user.role === "admin" && row.viewed_by === null) {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        const response = await fetch(
          `${API_BASE_URL}${API_ENDPOINTS.INVENTORY.MARK_VIEWED(row.id)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          setReports((prevReports) =>
            prevReports.map((report) => {
              if (report.id === row.id) {
                return {
                  ...report,
                  viewed_by: user.id,
                  isUnviewed: false,
                };
              }
              return report;
            })
          );
        }
      } catch (error) {
        console.error("Error marking report as viewed:", error);
      }
    }
    router.push(`/reports/${row.id}`);
  };

  const filteredReports = reports.filter((report) => {
    return branchType === "retail"
      ? report.branch.branch_type === "retail"
      : report.branch.branch_type === "wholesale";
  });

  const totalReports = filteredReports.length;
  const totalValue = filteredReports.reduce((sum, report) => {
    return (
      sum + report.items.reduce((itemSum, item) => itemSum + item.peso_value, 0)
    );
  }, 0);
  const totalItems = filteredReports.reduce(
    (sum, report) => sum + report.items_count,
    0
  );
  const uniqueBranches = new Set(
    filteredReports.map((report) => report.branch_name)
  ).size;
  const unviewedReports = filteredReports.filter(
    (report) => report.viewed_by === null
  ).length;

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">
              Inventory Reports
            </h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <div className="text-2xl font-bold">{totalReports}</div>
                <p className="text-xs text-muted-foreground">
                  Total inventory reports
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
                  {formatCurrency(totalValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total inventory value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Unviewed Reports
                </CardTitle>
                <FontAwesomeIcon
                  icon={faEye}
                  size="2x"
                  className="text-warning"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unviewedReports}</div>
                <p className="text-xs text-muted-foreground">
                  Reports you haven't reviewed yet
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">
                    This Month's Reports
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    {new Date().toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </CardDescription>
                </div>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    filteredReports.filter((report) => {
                      const reportDate = new Date(report.created_at);
                      const now = new Date();
                      return (
                        reportDate.getMonth() === now.getMonth() &&
                        reportDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Reports created this month
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>
                Comprehensive list of all inventory reports across branches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={filteredReports}
                  onRowClick={handleRowClick}
                  enableFiltering
                  enableSorting
                  enableColumnVisibility
                  filterColumn={["branch_name", "id"]}
                  filterPlaceholder="Search by branch name or report ID..."
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
