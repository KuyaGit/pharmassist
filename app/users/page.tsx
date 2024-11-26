"use client";

import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  CheckCircle,
  Key,
  UserPlus,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { Row } from "@tanstack/react-table";

interface User {
  id: number;
  username: string;
  role: string;
  branch_id: number | null;
  has_changed_password: boolean;
  created_at: string | null;
  profile?: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    license_number?: string;
  };
  branch?: {
    id: number;
    branch_name: string;
    branch_type: string;
  };
}

interface CreateUserRequest {
  username: string;
  password: string;
  role: "admin" | "pharmacist" | "wholesaler";
  branch_id: number | null;
}

interface Branch {
  id: number;
  branch_name: string;
  branch_type: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [newUser, setNewUser] = useState<CreateUserRequest>({
    username: "",
    password: "",
    role: "pharmacist",
    branch_id: null,
  });
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [initialPassword, setInitialPassword] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/pharmassist";
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.LIST_USERS}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.BRANCHES.LIST}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch branches");

      const data = await response.json();
      setBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      // Generate random username and password
      const randomString = Math.random().toString(36).substring(2, 8);
      const generatedUsername = `${newUser.role.substring(
        0,
        3
      )}${randomString}`;
      const generatedPassword = Math.random().toString(36).substring(2, 10);

      const userPayload = {
        ...newUser,
        username: generatedUsername,
        password: generatedPassword,
      };

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.CREATE_USER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userPayload),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create user");
      }

      const data = await response.json();
      toast.success("User created successfully", {
        description: `Username: ${data.username}\nPassword: ${data.password}`,
      });
      setIsCreateDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create user"
      );
    }
  };

  const getInitialPassword = async (userId: number) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.GET_INITIAL_PASSWORD(userId)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to get initial password");
      }

      const data = await response.json();
      setInitialPassword(data.initial_password);
      setShowPassword(true);
    } catch (error) {
      console.error("Error getting initial password:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to get initial password"
      );
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchBranches();
  }, []);

  const columns = [
    {
      accessorKey: "username",
      header: "Username",
    },
    {
      accessorKey: "profile",
      header: "Full Name",
      cell: ({ row }: { row: any }) => {
        const firstName = row.original.profile?.first_name || "";
        const lastName = row.original.profile?.last_name || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ");
        return <div className="font-medium">{fullName || "Not set"}</div>;
      },
      accessorFn: (row: User) => {
        const firstName = row.profile?.first_name || "";
        const lastName = row.profile?.last_name || "";
        return [firstName, lastName].filter(Boolean).join(" ");
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: { row: any }) => (
        <div className="capitalize">
          {row.original.role === "pharmacist" ? "Retailer" : row.original.role}
        </div>
      ),
    },
    {
      accessorKey: "has_changed_password",
      header: "Password Status",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          {row.original.has_changed_password ? (
            <Badge variant="success" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Changed
            </Badge>
          ) : (
            <Badge variant="warning" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Initial
            </Badge>
          )}
        </div>
      ),
      sortingFn: (rowA: Row<User>, rowB: Row<User>) => {
        const aValue = rowA.original.has_changed_password;
        const bValue = rowB.original.has_changed_password;
        if (aValue === bValue) {
          // If password status is the same, sort by full name
          const aName = rowA.getValue("profile") as string;
          const bName = rowB.getValue("profile") as string;
          return aName.localeCompare(bName);
        }
        // Initial password (false) comes first
        return aValue ? 1 : -1;
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: { row: any }) => (
        <div className="capitalize">
          {row.original.role === "pharmacist" ? "Retailer" : row.original.role}
        </div>
      ),
    },
    {
      accessorKey: "branch",
      header: "Branch",
      cell: ({ row }: { row: any }) => {
        if (row.original.role === "admin") {
          return <div className="text-muted-foreground">N/A</div>;
        }
        return (
          <div className="capitalize">
            {row.original.branch?.branch_name || "Unassigned"}
          </div>
        );
      },
    },
  ];

  const filteredBranches = branches.filter((branch) => {
    if (newUser.role === "wholesaler") {
      return branch.branch_type === "wholesale";
    } else if (newUser.role === "pharmacist") {
      return branch.branch_type === "retail";
    }
    return false;
  });

  const handleView = (user: User) => {
    setSelectedUserForView(user);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen">
      <SideNavBar />
      <div className="flex-1">
        <TopBar />
        <main className="flex-1 space-y-8 p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">
              User Management
            </h2>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(
                          value: "admin" | "pharmacist" | "wholesaler"
                        ) => {
                          const currentBranch = branches.find(
                            (b) => b.id === newUser.branch_id
                          );
                          const shouldResetBranch =
                            (value === "wholesaler" &&
                              currentBranch?.branch_type !== "wholesale") ||
                            (value === "pharmacist" &&
                              currentBranch?.branch_type !== "retail") ||
                            value === "admin";

                          setNewUser({
                            ...newUser,
                            role: value,
                            branch_id: shouldResetBranch
                              ? null
                              : newUser.branch_id,
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="pharmacist">Retailer</SelectItem>
                          <SelectItem value="wholesaler">Wholesaler</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newUser.role !== "admin" && (
                      <div className="grid gap-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select
                          value={newUser.branch_id?.toString() || "null"}
                          onValueChange={(value) =>
                            setNewUser({
                              ...newUser,
                              branch_id:
                                value === "null" ? null : parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null">No Branch</SelectItem>
                            {filteredBranches.map((branch) => (
                              <SelectItem
                                key={branch.id}
                                value={branch.id.toString()}
                              >
                                {branch.branch_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <Button type="submit" className="w-full">
                    Generate User
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    Manage user accounts and their roles
                  </CardDescription>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="pharmacist">Retailer</SelectItem>
                    <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={
                  roleFilter === "all"
                    ? users
                    : users.filter((user) => user.role === roleFilter)
                }
                enableFiltering
                enableSorting
                filterColumn={["username", "profile"]}
                filterPlaceholder="Filter by username or full name..."
                onRowClick={handleView}
                initialSorting={[{ id: "has_changed_password", desc: false }]}
              />
            </CardContent>
          </Card>

          <Dialog
            open={isViewDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsViewDialogOpen(false);
                setInitialPassword(null);
                setShowPassword(false);
              }
              setIsViewDialogOpen(open);
            }}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
              </DialogHeader>
              {selectedUserForView && (
                <div className="space-y-8">
                  {/* Header Section */}
                  <div className="flex items-start justify-between border-b pb-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {selectedUserForView.username}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">
                          {selectedUserForView.role === "pharmacist"
                            ? "Retailer"
                            : selectedUserForView.role}
                        </Badge>
                        {selectedUserForView.has_changed_password ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Password Changed
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Initial Password
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created{" "}
                      {new Date(
                        selectedUserForView.created_at!
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Profile Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Profile Information</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          First Name
                        </Label>
                        <p className="font-medium">
                          {selectedUserForView.profile?.first_name || "Not set"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Last Name
                        </Label>
                        <p className="font-medium">
                          {selectedUserForView.profile?.last_name || "Not set"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Email
                        </Label>
                        <p className="font-medium">
                          {selectedUserForView.profile?.email || "Not set"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Phone Number
                        </Label>
                        <p className="font-medium">
                          {selectedUserForView.profile?.phone_number ||
                            "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Branch Section */}
                  {selectedUserForView.branch && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Branch Information
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Branch Name
                          </Label>
                          <p className="font-medium">
                            {selectedUserForView.branch.branch_name}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">
                            Branch Type
                          </Label>
                          <p className="font-medium capitalize">
                            {selectedUserForView.branch.branch_type}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password Section */}
                  {!selectedUserForView.has_changed_password && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Initial Password</h3>
                      <div className="max-w-[50%] space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative flex-1">
                            <div className="flex h-10 w-full items-center rounded-md border bg-muted px-3 font-mono text-sm">
                              {initialPassword
                                ? showPassword
                                  ? initialPassword
                                  : "••••••••"
                                : "••••••••"}
                              {initialPassword && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (!initialPassword) {
                                getInitialPassword(selectedUserForView.id);
                              } else {
                                navigator.clipboard.writeText(initialPassword);
                                toast.success("Password copied to clipboard");
                              }
                            }}
                          >
                            {initialPassword ? (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </>
                            ) : (
                              <>
                                <Key className="mr-2 h-4 w-4" />
                                Get Password
                              </>
                            )}
                          </Button>
                        </div>
                        {initialPassword && (
                          <p className="text-sm text-muted-foreground">
                            Make sure to copy this password and share it
                            securely with the user. They will be required to
                            change it on their first login.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
