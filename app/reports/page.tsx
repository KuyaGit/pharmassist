"use client";

import { useState } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
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
} from "@fortawesome/free-solid-svg-icons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data for inventory reports
const inventoryReportsData = [
  {
    id: 1,
    branch_id: 1,
    date_created: "2023-06-01",
    last_edit: "2023-06-01",
    status: "approved",
  },
  {
    id: 2,
    branch_id: 2,
    date_created: "2023-06-02",
    last_edit: "2023-06-03",
    status: "pending",
  },
  {
    id: 3,
    branch_id: 1,
    date_created: "2023-06-03",
    last_edit: "2023-06-03",
    status: "approved",
  },
];

export default function InventoryReports() {
  const columns: ColumnDef<(typeof inventoryReportsData)[0]>[] = [
    {
      accessorKey: "id",
      header: "Report ID",
    },
    {
      accessorKey: "branch_id",
      header: "Branch ID",
    },
    {
      accessorKey: "date_created",
      header: "Date Created",
    },
    {
      accessorKey: "last_edit",
      header: "Last Edit",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <Badge
            variant={status === "approved" ? "active" : "secondary"}
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
            <Button>Create New Report</Button>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Inventory Reports</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-bold">
                  Total Reports
                </CardTitle>
                <FontAwesomeIcon
                  icon={faClipboardList}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inventoryReportsData.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time reports
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Approved Reports
                </CardTitle>
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    inventoryReportsData.filter(
                      (report) => report.status === "approved"
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Reports with approved status
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Reports
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
                    inventoryReportsData.filter(
                      (report) => report.status === "pending"
                    ).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Reports awaiting approval
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Latest Report Date
                </CardTitle>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {inventoryReportsData.reduce(
                    (latest, report) =>
                      report.date_created > latest
                        ? report.date_created
                        : latest,
                    "0000-00-00"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Date of the most recent report
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Inventory Reports</CardTitle>
              <CardDescription>A list of all inventory reports</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={inventoryReportsData}
                filterColumn="status"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
