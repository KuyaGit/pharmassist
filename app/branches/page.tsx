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
import {
  ArrowRight,
  Plus,
  Search,
  MapPin,
  AlertCircle,
  Clock,
  Check,
  X,
} from "lucide-react";
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
  has_low_stock: boolean;
  has_near_expiry: boolean;
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

  const filteredBranches = branches
    .filter((branch) => {
      if (!branch || !branch.branch_name) return false;

      const matchesSearch = branch.branch_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? branch.is_active : !branch.is_active);
      const matchesBranchType = branch.branch_type === branchType;

      return matchesSearch && matchesStatus && matchesBranchType;
    })
    .sort((a, b) => {
      // First sort by active status
      if (a.is_active && !b.is_active) return -1;
      if (!a.is_active && b.is_active) return 1;

      // Then sort alphabetically within each group
      return a.branch_name.localeCompare(b.branch_name);
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
                    "group relative overflow-hidden transition-all hover:shadow-lg flex flex-col",
                    !branch.is_active && "opacity-75"
                  )}
                >
                  <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 transition-all duration-200 group-hover:scale-75 group-hover:translate-x-4">
                    <Badge
                      variant={branch.is_active ? "success" : "secondary"}
                      className={cn(
                        "transition-all duration-200 group-hover:w-8 group-hover:h-8 group-hover:p-0 group-hover:rounded-full group-hover:flex group-hover:items-center group-hover:justify-center",
                        branch.is_active
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
                        "group-hover:[&>span]:hidden"
                      )}
                    >
                      <span>{branch.is_active ? "Active" : "Inactive"}</span>
                      {branch.is_active ? (
                        <Check className="hidden h-4 w-4 group-hover:block" />
                      ) : (
                        <X className="hidden h-4 w-4 group-hover:block" />
                      )}
                    </Badge>
                    {branch.has_low_stock && (
                      <Badge
                        variant="destructive"
                        className={cn(
                          "transition-all duration-200 group-hover:w-8 group-hover:h-8 group-hover:p-0 group-hover:rounded-full group-hover:flex group-hover:items-center group-hover:justify-center",
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
                          "flex items-center gap-1",
                          "group-hover:[&>span]:hidden"
                        )}
                      >
                        <span>Low Stock</span>
                        <AlertCircle className="h-3 w-3" />
                      </Badge>
                    )}
                    {branch.has_near_expiry && (
                      <Badge
                        variant="warning"
                        className={cn(
                          "transition-all duration-200 group-hover:w-8 group-hover:h-8 group-hover:p-0 group-hover:rounded-full group-hover:flex group-hover:items-center group-hover:justify-center",
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
                          "flex items-center gap-1",
                          "group-hover:[&>span]:hidden"
                        )}
                      >
                        <span>Near Expiry</span>
                        <Clock className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 p-6">
                    <CardTitle className="text-xl font-semibold tracking-tight">
                      {branch.branch_name}
                    </CardTitle>
                    <CardDescription className="flex items-center text-sm mt-2">
                      <MapPin className="mr-1 h-4 w-4" />
                      {branch.location}
                    </CardDescription>
                  </div>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      asChild
                      size="sm"
                      className="hover:translate-x-1 transition-all"
                    >
                      <Link
                        href={`/branches/${branch.id}`}
                        className="flex items-center"
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
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
