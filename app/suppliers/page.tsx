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
  faTruck,
  faBoxes,
  faMoneyBillWave,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

// Mock data for suppliers
const suppliersData = [
  {
    id: 1,
    name: "Supplier A",
    contact: "John Doe",
    email: "john@suppliera.com",
    phone: "123-456-7890",
    lastOrderDate: "2023-06-15",
    totalOrders: 25,
  },
  {
    id: 2,
    name: "Supplier B",
    contact: "Jane Smith",
    email: "jane@supplierb.com",
    phone: "987-654-3210",
    lastOrderDate: "2023-06-20",
    totalOrders: 18,
  },
  {
    id: 3,
    name: "Supplier C",
    contact: "Bob Johnson",
    email: "bob@supplierc.com",
    phone: "456-789-0123",
    lastOrderDate: "2023-06-18",
    totalOrders: 30,
  },
];

export default function Suppliers() {
  const columns: ColumnDef<(typeof suppliersData)[0]>[] = [
    {
      accessorKey: "id",
      header: "Supplier ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "contact",
      header: "Contact Person",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "lastOrderDate",
      header: "Last Order Date",
    },
    {
      accessorKey: "totalOrders",
      header: ({ column }) => {
        return <div className="text-right">Total Orders</div>;
      },
      cell: ({ row }) => {
        const totalOrders = parseInt(row.getValue("totalOrders"));
        return <div className="text-right font-medium">{totalOrders}</div>;
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
            <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
            <Button>Add New Supplier</Button>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Suppliers</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Suppliers
                </CardTitle>
                <FontAwesomeIcon
                  icon={faTruck}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{suppliersData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active suppliers in the system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Orders
                </CardTitle>
                <FontAwesomeIcon
                  icon={faBoxes}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {suppliersData.reduce(
                    (sum, supplier) => sum + supplier.totalOrders,
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Cumulative orders from all suppliers
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Orders per Supplier
                </CardTitle>
                <FontAwesomeIcon
                  icon={faMoneyBillWave}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    suppliersData.reduce(
                      (sum, supplier) => sum + supplier.totalOrders,
                      0
                    ) / suppliersData.length
                  ).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average number of orders per supplier
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Latest Order Date
                </CardTitle>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {suppliersData.reduce(
                    (latest, supplier) =>
                      supplier.lastOrderDate > latest
                        ? supplier.lastOrderDate
                        : latest,
                    "0000-00-00"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Most recent order date across all suppliers
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Supplier List</CardTitle>
              <CardDescription>A list of all active suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={suppliersData}
                filterColumn="name"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
