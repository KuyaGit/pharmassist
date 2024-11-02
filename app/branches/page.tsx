"use client";

import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
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
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbLink,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowRight, Plus, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Mock data for branches
const branches = [
  {
    id: 1,
    name: "Main Branch",
    location: "New York City, NY",
    status: "active",
  },
  {
    id: 2,
    name: "Downtown Branch",
    location: "Los Angeles, CA",
    status: "active",
  },
  { id: 3, name: "Uptown Branch", location: "Chicago, IL", status: "inactive" },
  { id: 4, name: "Suburban Branch", location: "Houston, TX", status: "active" },
  {
    id: 5,
    name: "Central Branch",
    location: "Phoenix, AZ",
    status: "inactive",
  },
];

export default function Branches() {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBranches = branches.filter(
    (branch) =>
      (branch.name.toLowerCase().includes(filter.toLowerCase()) ||
        branch.location.toLowerCase().includes(filter.toLowerCase())) &&
      (statusFilter === "all" || branch.status === statusFilter)
  );

  return (
    <div className="overflow-hidden bg-muted/40 flex h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SideNavBar />
      <div className="overflow-hidden flex-1 flex flex-col">
        <TopBar />
        <main className="overflow-y-auto flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Branch</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new branch and set up the account
                    credentials. Click save when you're done.
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
                    <Label htmlFor="location" className="text-right">
                      Location
                    </Label>
                    <Input id="location" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Status
                    </Label>
                    <Select>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogDescription>
                    Set up account credentials for this branch
                  </DialogDescription>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="username" className="text-right">
                      Username
                    </Label>
                    <Input id="username" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="confirmPassword" className="text-right">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search branches..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {filteredBranches.map((branch) => (
              <Card
                key={branch.id}
                className={cn(
                  branch.status === "inactive" && "",
                  "relative overflow-hidden"
                )}
              >
                <div className="absolute top-2 right-2 z-10">
                  <Badge
                    variant={
                      branch.status === "active" ? "active" : "secondary"
                    }
                    className={cn(
                      branch.status === "inactive" && "",
                      "relative overflow-hidden"
                    )}
                  >
                    {branch.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <CardHeader
                  className={cn(
                    branch.status === "inactive" && "opacity-60",
                    "relative overflow-hidden"
                  )}
                >
                  <CardTitle>{branch.name}</CardTitle>
                  <CardDescription>{branch.location}</CardDescription>
                </CardHeader>

                <CardFooter
                  className={cn(
                    branch.status === "inactive" && "opacity-60",
                    ""
                  )}
                >
                  <Button asChild>
                    <Link
                      href={`/branches/${branch.id}`}
                      className="flex items-center gap-2"
                    >
                      See More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
