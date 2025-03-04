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
  Users as UsersIcon,
  Store,
  Building2,
  Loader2,
} from "lucide-react";
import { Row } from "@tanstack/react-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleResetPassword = async (userId: number) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.RESET_PASSWORD(userId)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to reset password");
      }

      const data = await response.json();
      toast.success("Password reset successfully", {
        description: (
          <div className="mt-2 rounded-md bg-muted p-2">
            <p>New password for {data.username}:</p>
            <code className="mt-2 block font-mono text-sm">
              {data.temporary_password}
            </code>
            <p className="mt-2 text-xs text-muted-foreground">
              Make sure to copy and share this password securely with the user.
            </p>
          </div>
        ),
        duration: 10000,
      });

      // Update the selected user's password status in the UI
      if (selectedUserForView) {
        setSelectedUserForView({
          ...selectedUserForView,
          has_changed_password: false,
        });
      }

      // Refresh user data and reset states
      fetchUsers();
      setInitialPassword(data.temporary_password);
      setShowPassword(true);
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    }
  };

  const handleBranchChange = (value: string) => {
    if (!selectedUserForView) return;

    const newBranchId = value === "null" ? null : parseInt(value);
    if (newBranchId !== selectedUserForView.branch_id) {
      setSelectedUserForView({
        ...selectedUserForView,
        branch_id: newBranchId,
        branch: newBranchId
          ? branches.find((b) => b.id === newBranchId)
          : undefined,
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleUpdateUserBranch = async () => {
    if (!selectedUserForView) return;

    setIsUpdating(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE_URL}/auth/users/${selectedUserForView.id}/branch`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            branch_id: selectedUserForView.branch_id,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to update user branch");
      }

      // Update the users list with the new branch assignment
      setUsers(
        users.map((user) =>
          user.id === selectedUserForView.id
            ? {
                ...user,
                branch_id: selectedUserForView.branch_id,
                branch: selectedUserForView.branch,
              }
            : user
        )
      );

      setHasUnsavedChanges(false);
      toast.success("User branch updated successfully");
    } catch (error) {
      console.error("Error updating user branch:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user branch"
      );
    } finally {
      setIsUpdating(false);
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
              Temporary
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
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <UsersIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active user accounts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retailers</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((user) => user.role === "pharmacist").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Retail pharmacy users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Wholesalers
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((user) => user.role === "wholesaler").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Wholesale pharmacy users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Setup
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((user) => !user.has_changed_password).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Users with temporary password
                </p>
              </CardContent>
            </Card>
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
                            Temporary Password
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
                  {selectedUserForView &&
                    selectedUserForView.role !== "admin" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">
                            Branch Information
                          </h3>
                        </div>
                        <div className="grid gap-4 rounded-lg border bg-muted/50 p-4">
                          <div className="space-y-2">
                            <Label>Branch Assignment</Label>
                            <Select
                              value={
                                selectedUserForView.branch_id?.toString() ||
                                "null"
                              }
                              onValueChange={handleBranchChange}
                            >
                              <SelectTrigger className="bg-background">
                                <SelectValue placeholder="Select branch" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="null">No Branch</SelectItem>
                                {branches
                                  .filter(
                                    (branch) =>
                                      (selectedUserForView.role ===
                                        "wholesaler" &&
                                        branch.branch_type === "wholesale") ||
                                      (selectedUserForView.role ===
                                        "pharmacist" &&
                                        branch.branch_type === "retail")
                                  )
                                  .map((branch) => (
                                    <SelectItem
                                      key={branch.id}
                                      value={branch.id.toString()}
                                    >
                                      {branch.branch_name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              {selectedUserForView.role === "wholesaler"
                                ? "Can only be assigned to wholesale branches"
                                : "Can only be assigned to retail branches"}
                            </p>
                          </div>
                          {selectedUserForView.branch && (
                            <div className="space-y-1 rounded-md bg-background p-3">
                              <Label className="text-xs text-muted-foreground">
                                Current Branch Type
                              </Label>
                              <p className="font-medium capitalize">
                                {selectedUserForView.branch.branch_type}
                              </p>
                            </div>
                          )}
                          {hasUnsavedChanges && (
                            <Button
                              onClick={handleUpdateUserBranch}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Password Management Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">
                          Password Management
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedUserForView.has_changed_password
                            ? "User has changed their password"
                            : "User is still using their temporary password"}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="text-red-600 dark:text-red-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                          >
                            <Key className="mr-2 h-4 w-4" />
                            Reset Password
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Reset User Password
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will reset the password for user "
                              {selectedUserForView.username}". A new temporary
                              password will be generated. The user will need to
                              change this password on their next login.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleResetPassword(selectedUserForView.id)
                              }
                              className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800 text-white"
                            >
                              Reset Password
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    {!selectedUserForView.has_changed_password && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">
                            Temporary Password
                          </CardTitle>
                          <CardDescription>
                            This password is only available until the user
                            changes it
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
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
                                  navigator.clipboard.writeText(
                                    initialPassword
                                  );
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
                                  Get Temporary Password
                                </>
                              )}
                            </Button>
                          </div>
                          {initialPassword && (
                            <p className="text-sm text-muted-foreground">
                              Make sure to copy this temporary password and
                              share it securely with the user. They will be
                              required to change it on their first login.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
