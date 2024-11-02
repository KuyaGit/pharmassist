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
  faTag,
  faExclamationTriangle,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data for products
const productsData = [
  {
    id: 1,
    name: "Product A",
    category: "Category 1",
    cost: 10.0,
    srp: 15.0,
  },
  {
    id: 2,
    name: "Product B",
    category: "Category 2",
    cost: 20.0,
    srp: 30.0,
  },
  {
    id: 3,
    name: "Product C",
    category: "Category 1",
    cost: 15.0,
    srp: 25.0,
  },
  {
    id: 4,
    name: "Product D",
    category: "Category 3",
    cost: 30.0,
    srp: 45.0,
  },
  {
    id: 5,
    name: "Product E",
    category: "Category 2",
    cost: 25.0,
    srp: 40.0,
  },
];

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const columns: ColumnDef<(typeof productsData)[0]>[] = [
    {
      accessorKey: "id",
      header: "Product ID",
    },
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "cost",
      header: ({ column }) => {
        return <div className="text-right">Cost</div>;
      },
      cell: ({ row }) => {
        const cost = parseFloat(row.getValue("cost"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(cost);
        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "srp",
      header: ({ column }) => {
        return <div className="text-right">SRP</div>;
      },
      cell: ({ row }) => {
        const srp = parseFloat(row.getValue("srp"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(srp);
        return <div className="text-right font-medium">{formatted}</div>;
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
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Product</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new product here. Click save when
                    you're done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">
                      Category
                    </Label>
                    <Input id="category" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cost" className="text-right">
                      Cost
                    </Label>
                    <Input id="cost" type="number" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="srp" className="text-right">
                      SRP
                    </Label>
                    <Input id="srp" type="number" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Products</BreadcrumbPage>
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
                <div className="text-2xl font-bold">{productsData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all categories
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Price
                </CardTitle>
                <FontAwesomeIcon icon={faTag} size="2x" className="text-icon" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    productsData.reduce(
                      (acc, product) => acc + product.srp,
                      0
                    ) / productsData.length
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average SRP across all products
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Profit Margin
                </CardTitle>
                <FontAwesomeIcon
                  icon={faChartLine}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(
                    (productsData.reduce(
                      (sum, product) =>
                        sum + (product.srp - product.cost) / product.srp,
                      0
                    ) /
                      productsData.length) *
                    100
                  ).toFixed(2)}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  Average profit margin across all products
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Highest Priced Product
                </CardTitle>
                <FontAwesomeIcon
                  icon={faChartLine}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(
                    Math.max(...productsData.map((product) => product.srp))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Highest SRP in the inventory
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Product List</CardTitle>
              <CardDescription>
                A list of all products in inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={productsData}
                filterColumn="name"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
