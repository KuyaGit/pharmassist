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
  faBoxes,
  faStore,
  faExclamationTriangle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data for inventory
const inventoryData = [
  {
    id: 1,
    product_name: "Product A",
    branch_name: "Branch 1",
    stock_level: 100,
    expiry_date: "2023-12-31",
  },
  {
    id: 2,
    product_name: "Product B",
    branch_name: "Branch 2",
    stock_level: 50,
    expiry_date: "2023-11-30",
  },
  {
    id: 3,
    product_name: "Product C",
    branch_name: "Branch 1",
    stock_level: 75,
    expiry_date: "2024-03-15",
  },
  {
    id: 4,
    product_name: "Product D",
    branch_name: "Branch 3",
    stock_level: 30,
    expiry_date: "2023-10-31",
  },
  {
    id: 5,
    product_name: "Product E",
    branch_name: "Branch 2",
    stock_level: 120,
    expiry_date: "2024-01-31",
  },
  {
    id: 6,
    product_name: "Product F",
    branch_name: "Branch 1",
    stock_level: 40,
    expiry_date: "2023-11-15",
  },
  {
    id: 7,
    product_name: "Product G",
    branch_name: "Branch 3",
    stock_level: 90,
    expiry_date: "2024-02-28",
  },
  {
    id: 8,
    product_name: "Product H",
    branch_name: "Branch 2",
    stock_level: 60,
    expiry_date: "2023-12-15",
  },
  {
    id: 9,
    product_name: "Product I",
    branch_name: "Branch 1",
    stock_level: 25,
    expiry_date: "2023-10-20",
  },
  {
    id: 10,
    product_name: "Product J",
    branch_name: "Branch 3",
    stock_level: 80,
    expiry_date: "2024-04-30",
  },
  // Same products for different branches
  {
    id: 11,
    product_name: "Product A",
    branch_name: "Branch 2",
    stock_level: 85,
    expiry_date: "2023-12-15",
  },
  {
    id: 12,
    product_name: "Product B",
    branch_name: "Branch 1",
    stock_level: 70,
    expiry_date: "2023-11-20",
  },
  {
    id: 13,
    product_name: "Product C",
    branch_name: "Branch 3",
    stock_level: 55,
    expiry_date: "2024-02-28",
  },
  {
    id: 14,
    product_name: "Product D",
    branch_name: "Branch 2",
    stock_level: 45,
    expiry_date: "2023-10-25",
  },
  {
    id: 15,
    product_name: "Product E",
    branch_name: "Branch 1",
    stock_level: 110,
    expiry_date: "2024-01-15",
  },
];

export default function Inventory() {
  const [filter, setFilter] = useState({
    branch: "all",
    status: "all",
  });

  const columns: ColumnDef<(typeof inventoryData)[0]>[] = [
    {
      accessorKey: "product_name",
      header: "Product Name",
    },
    {
      accessorKey: "branch_name",
      header: "Branch",
    },
    {
      accessorKey: "stock_level",
      header: "Stock Level",
    },
    {
      accessorKey: "expiry_date",
      header: "Expiry Date",
    },
  ];

  const filteredData = inventoryData.filter((item) => {
    const branchMatch =
      filter.branch === "all" || item.branch_name === filter.branch;
    const statusMatch =
      filter.status === "all" ||
      (filter.status === "lowStock" && item.stock_level < 50) ||
      (filter.status === "nearExpiry" &&
        new Date(item.expiry_date) <=
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

    return branchMatch && statusMatch;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Inventory</BreadcrumbPage>
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
                <div className="text-2xl font-bold">{inventoryData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all branches
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Branches
                </CardTitle>
                <FontAwesomeIcon
                  icon={faStore}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(inventoryData.map((item) => item.branch_name)).size}
                </div>
                <p className="text-xs text-muted-foreground">
                  With inventory data
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
                  {inventoryData.filter((item) => item.stock_level < 50).length}
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
                    inventoryData.filter(
                      (item) =>
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
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Inventory List</CardTitle>
              <CardDescription>
                A list of all products across all branches
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="branch-filter">Branch</Label>
                  <Select
                    value={filter.branch}
                    onValueChange={(value) =>
                      setFilter({ ...filter, branch: value })
                    }
                  >
                    <SelectTrigger id="branch-filter">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {Array.from(
                        new Set(inventoryData.map((item) => item.branch_name))
                      ).map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select
                    value={filter.status}
                    onValueChange={(value) =>
                      setFilter({ ...filter, status: value })
                    }
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="lowStock">Low Stock</SelectItem>
                      <SelectItem value="nearExpiry">Near Expiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DataTable
                columns={columns}
                data={filteredData}
                filterColumn="product_name"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
