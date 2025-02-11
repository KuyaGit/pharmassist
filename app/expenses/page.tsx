"use client";

import { useEffect, useState } from "react";
import { SideNavBar } from "@/components/SideNavBar";
import { TopBar } from "@/components/TopBar";
import {
  Expense,
  ExpenseType,
  ExpenseScope,
  ExpenseAnalytics,
} from "@/types/expense";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDollarSign,
  faChartLine,
  faCalendarAlt,
  faShoppingCart,
  faEllipsisVertical,
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Branch } from "@/types/branch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2Icon, XCircleIcon, AlertCircleIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Expenses() {
  const [user] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}")
  );
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [analytics, setAnalytics] = useState<ExpenseAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    name: "",
    type: ExpenseType.UTILITIES,
    amount: 0,
    scope: ExpenseScope.BRANCH,
    branch_id: null,
    date_created: format(new Date(), "yyyy-MM-dd"),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedExpenseForView, setSelectedExpenseForView] =
    useState<Expense | null>(null);

  const fetchData = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/pharmassist";
        return;
      }

      const [expensesRes, analyticsRes] = await Promise.all([
        fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSES.LIST}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
        fetch(`${API_BASE_URL}${API_ENDPOINTS.EXPENSES.ANALYTICS}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ]);

      if (!expensesRes.ok || !analyticsRes.ok) {
        const errorData = await expensesRes.text();
        console.error("API Error:", errorData);
        throw new Error("Failed to fetch data");
      }

      const expensesData = await expensesRes.json();
      const analyticsData = await analyticsRes.json();

      console.log("Expenses Data:", expensesData);
      console.log("Analytics Data:", analyticsData);

      setExpenses(expensesData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch expenses data");
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

      if (!token) return;

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

  useEffect(() => {
    fetchData();
    fetchBranches();
  }, [user.id]);

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "type",
      header: "Category",
      cell: ({ row }) => {
        const type = row.getValue("type") as ExpenseType;
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        return new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount);
      },
    },
    {
      accessorKey: "scope",
      header: "Allocated To",
      cell: ({ row }) => {
        const scope = row.getValue("scope") as ExpenseScope;
        const branch = row.original.branch;

        if (scope === ExpenseScope.BRANCH && branch) {
          return branch.branch_name;
        } else if (scope === ExpenseScope.MAIN_OFFICE) {
          return "Main Office";
        } else {
          return "Company Wide";
        }
      },
    },
    {
      accessorKey: "date_created",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.getValue("date_created")), "MMM d, yyyy"),
    },
  ];

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) throw new Error("Authentication token not found");

      const endpoint = newExpense.id
        ? API_ENDPOINTS.EXPENSES.UPDATE(newExpense.id)
        : API_ENDPOINTS.EXPENSES.CREATE;

      const method = newExpense.id ? "PUT" : "POST";

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok)
        throw new Error(
          `Failed to ${newExpense.id ? "update" : "create"} expense`
        );

      setIsDialogOpen(false);
      await fetchData();
      resetForm();
      showToast(
        `Expense ${newExpense.id ? "updated" : "created"} successfully`,
        "success"
      );
    } catch (error: any) {
      showToast(error.message, "error");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setNewExpense({
      ...expense,
      branch_id: expense.branch_id || undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) throw new Error("Authentication token not found");

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.EXPENSES.DELETE(expenseToDelete.id)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to delete expense");

      await fetchData();
      showToast("Expense deleted successfully", "success");
    } catch (error: any) {
      showToast(error.message, "error");
      console.error(error);
    } finally {
      setIsDeleteAlertOpen(false);
      setExpenseToDelete(null);
    }
  };

  const resetForm = () => {
    setNewExpense({
      name: "",
      type: ExpenseType.UTILITIES,
      amount: 0,
      scope: ExpenseScope.BRANCH,
      branch_id: null,
      date_created: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "warning"
  ) => {
    const styles = {
      success: {
        icon: (
          <div className="rounded-full bg-green-500">
            <CheckCircle2Icon className="h-5 w-5 text-white" />
          </div>
        ),
        className:
          "bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 font-medium",
      },
      error: {
        icon: (
          <div className="rounded-full bg-red-500">
            <XCircleIcon className="h-5 w-5 text-white" />
          </div>
        ),
        className:
          "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-medium",
      },
      warning: {
        icon: (
          <div className="rounded-full bg-yellow-500">
            <AlertCircleIcon className="h-5 w-5 text-white" />
          </div>
        ),
        className:
          "bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-400 font-medium",
      },
    };

    toast(message, {
      icon: styles[type].icon,
      className: styles[type].className,
      duration: 3000,
    });
  };

  useEffect(() => {
    if (selectedExpenseForView) {
      setIsViewDialogOpen(true);
    }
  }, [selectedExpenseForView]);

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                if (!open) resetForm();
                setIsDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button>Add New Expense</Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreateExpense}>
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newExpense.name}
                        onChange={(e) =>
                          setNewExpense({ ...newExpense, name: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">
                        Category
                      </Label>
                      <Select
                        value={newExpense.type}
                        onValueChange={(value) =>
                          setNewExpense({
                            ...newExpense,
                            type: value as ExpenseType,
                          })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(ExpenseType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="scope" className="text-right">
                        Allocated To
                      </Label>
                      <Select
                        value={newExpense.scope}
                        onValueChange={(value) => {
                          const scope = value as ExpenseScope;
                          setNewExpense({
                            ...newExpense,
                            scope,
                            // Clear branch_id if scope is not branch
                            branch_id:
                              scope === ExpenseScope.BRANCH
                                ? newExpense.branch_id
                                : null,
                          });
                        }}
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(ExpenseScope).map((scope) => (
                            <SelectItem key={scope} value={scope}>
                              {scope.replace("_", " ").charAt(0).toUpperCase() +
                                scope.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {newExpense.scope === ExpenseScope.BRANCH && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="branch" className="text-right">
                          Branch
                        </Label>
                        <Select
                          value={newExpense.branch_id?.toString() || ""}
                          onValueChange={(value) =>
                            setNewExpense({
                              ...newExpense,
                              branch_id: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-right">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            amount: parseFloat(e.target.value),
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="date" className="text-right">
                        Date
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={newExpense.date_created}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            date_created: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Expenses
                </CardTitle>
                <FontAwesomeIcon
                  icon={faDollarSign}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(analytics?.total_amount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {typeof analytics?.month_over_month_change === "number"
                    ? `${
                        analytics.month_over_month_change > 0 ? "+" : ""
                      }${analytics.month_over_month_change.toFixed(
                        1
                      )}% from last month`
                    : "No data from last month"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Daily Average
                </CardTitle>
                <FontAwesomeIcon
                  icon={faChartLine}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-PH", {
                    style: "currency",
                    currency: "PHP",
                  }).format(analytics?.daily_average || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current month average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Highest Category
                </CardTitle>
                <FontAwesomeIcon
                  icon={faShoppingCart}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.highest_category
                    ? analytics.highest_category.charAt(0).toUpperCase() +
                      analytics.highest_category.slice(1)
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.highest_category_percentage
                    ? `${analytics.highest_category_percentage.toFixed(
                        1
                      )}% of total expenses`
                    : "No data available"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Last Expense
                </CardTitle>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  size="2x"
                  className="text-icon"
                />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics?.last_expense_date ? (
                    <>
                      <div>
                        {format(
                          new Date(analytics.last_expense_date),
                          "MMM d, yyyy"
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(
                          new Date(analytics.last_expense_date),
                          {
                            addSuffix: true,
                          }
                        )}
                      </p>
                    </>
                  ) : (
                    "N/A"
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>A list of your recent expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={expenses}
                enableFiltering
                enableSorting
                enableColumnVisibility
                filterColumn={["name"]}
                filterPlaceholder="Search by expense name..."
                contextMenuOptions={(row: Expense) => [
                  {
                    label: "Edit",
                    icon: (
                      <FontAwesomeIcon
                        icon={faPencil}
                        className="mr-2 h-4 w-4"
                      />
                    ),
                    onClick: () => handleEdit(row),
                  },
                  {
                    label: "Delete",
                    icon: (
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="mr-2 h-4 w-4"
                      />
                    ),
                    onClick: () => handleDelete(row),
                    variant: "danger",
                  },
                ]}
                onRowClick={(row) => setSelectedExpenseForView(row)}
              />
            </CardContent>
          </Card>
          <AlertDialog
            open={isDeleteAlertOpen}
            onOpenChange={setIsDeleteAlertOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete expense "{expenseToDelete?.name}"
                  and remove it from the database. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Expense
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Dialog
            open={isViewDialogOpen}
            onOpenChange={(open) => {
              setIsViewDialogOpen(open);
              if (!open) {
                setSelectedExpenseForView(null);
              }
            }}
          >
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle className="text-2xl">Expense Details</DialogTitle>
              </DialogHeader>
              {selectedExpenseForView && (
                <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold">
                        {selectedExpenseForView.name}
                      </h1>
                      <div className="space-y-1 mt-2">
                        <p className="text-sm text-muted-foreground">
                          Created:{" "}
                          {format(
                            new Date(selectedExpenseForView.created_at),
                            "MMM d, yyyy"
                          )}{" "}
                          at{" "}
                          <span className="font-medium">
                            {format(
                              new Date(selectedExpenseForView.created_at),
                              "h:mm a"
                            )}
                          </span>
                        </p>
                        {selectedExpenseForView.updated_at && (
                          <p className="text-sm text-muted-foreground">
                            Updated:{" "}
                            {format(
                              new Date(selectedExpenseForView.updated_at),
                              "MMM d, yyyy"
                            )}{" "}
                            at{" "}
                            <span className="font-medium">
                              {format(
                                new Date(selectedExpenseForView.updated_at),
                                "h:mm a"
                              )}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("en-PH", {
                          style: "currency",
                          currency: "PHP",
                        }).format(selectedExpenseForView.amount)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {selectedExpenseForView.type.charAt(0).toUpperCase() +
                          selectedExpenseForView.type.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 space-y-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            Date
                          </Label>
                          <div className="mt-1 text-lg font-medium">
                            {format(
                              new Date(selectedExpenseForView.date_created),
                              "MMMM d, yyyy"
                            )}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            Allocated To
                          </Label>
                          <div className="mt-1 text-lg font-medium">
                            {selectedExpenseForView.scope ===
                            ExpenseScope.BRANCH
                              ? selectedExpenseForView.branch?.branch_name
                              : selectedExpenseForView.scope ===
                                ExpenseScope.MAIN_OFFICE
                              ? "Main Office"
                              : "Company Wide"}
                          </div>
                        </div>
                      </div>
                    </div>
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
