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
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { useBranchTypeStore } from "@/lib/store/branch-type-store";

interface Branch {
  id: number;
  branch_name: string;
  location: string;
  is_active: boolean;
  branch_type: string;
}

export default function Branches() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newBranch, setNewBranch] = useState({
    branch_name: "",
    location: "",
    is_active: true,
    branch_type: "retail",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const branchType = useBranchTypeStore((state) => state.branchType);

  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    try {
      const token = getCookie("token");
      console.log("Token:", token);
      console.log("API URL:", `${API_BASE_URL}${API_ENDPOINTS.BRANCHES.LIST}`);

      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BRANCHES.LIST}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch branches: ${data.detail || "Unknown error"}`
        );
      }

      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load branches");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredBranches = branches.filter((branch) => {
    if (!branch || !branch.branch_name) return false;

    const matchesSearch = branch.branch_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" ? branch.is_active : !branch.is_active);
    const matchesBranchType = branch.branch_type === branchType;

    return matchesSearch && matchesStatus && matchesBranchType;
  });

  async function handleAddBranch(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = getCookie("token");
      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BRANCHES.CREATE}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBranch),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create branch");
      }

      toast.success("Branch created successfully");
      fetchBranches();
      setNewBranch({
        branch_name: "",
        location: "",
        is_active: true,
        branch_type: "retail",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating branch:", error);
      toast.error("Failed to create branch");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden bg-muted/40 flex h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <SideNavBar />
      <div className="overflow-hidden flex-1 flex flex-col">
        <TopBar />
        <main className="overflow-y-auto flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Branches</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Branch
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddBranch}>
                  <DialogHeader>
                    <DialogTitle>Add New Branch</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new branch. Click save when
                      you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="branch_name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="branch_name"
                        value={newBranch.branch_name}
                        onChange={(e) =>
                          setNewBranch({
                            ...newBranch,
                            branch_name: e.target.value,
                          })
                        }
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="location" className="text-right">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={newBranch.location}
                        onChange={(e) =>
                          setNewBranch({
                            ...newBranch,
                            location: e.target.value,
                          })
                        }
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="branch_type" className="text-right">
                        Type
                      </Label>
                      <Select
                        value={newBranch.branch_type}
                        onValueChange={(value) =>
                          setNewBranch({
                            ...newBranch,
                            branch_type: value,
                          })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select branch type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="wholesale">Wholesale</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <Select
                        value={newBranch.is_active ? "active" : "inactive"}
                        onValueChange={(value) =>
                          setNewBranch({
                            ...newBranch,
                            is_active: value === "active",
                          })
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
                          Creating...
                        </>
                      ) : (
                        "Create Branch"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredBranches.map((branch) => (
                <Card
                  key={branch.id}
                  className={cn(
                    branch.is_active === false && "",
                    "relative overflow-hidden"
                  )}
                >
                  <div className="absolute top-2 right-2 z-10">
                    <Badge
                      variant={branch.is_active ? "active" : "secondary"}
                      className={cn(
                        !branch.is_active && "",
                        "relative overflow-hidden"
                      )}
                    >
                      {branch.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <CardHeader
                    className={cn(
                      branch.is_active === false && "opacity-60",
                      "relative overflow-hidden"
                    )}
                  >
                    <CardTitle>{branch.branch_name}</CardTitle>
                    <CardDescription>{branch.location}</CardDescription>
                  </CardHeader>

                  <CardFooter
                    className={cn(
                      branch.is_active === false && "opacity-60",
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
          )}
        </main>
      </div>
    </div>
  );
}
function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return null;
}
