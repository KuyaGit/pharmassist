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
    description: "",
    vendor: "",
    scope: ExpenseScope.BRANCH,
    branch_id: null,
    date_created: format(new Date(), "yyyy-MM-dd"),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "type",
      header: "Category",
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
      header: "Scope",
      cell: ({ row }) => {
        const scope = row.getValue("scope") as ExpenseScope;
        return scope.replace("_", " ").charAt(0).toUpperCase() + scope.slice(1);
      },
    },
    {
      accessorKey: "date_created",
      header: "Date",
      cell: ({ row }) =>
        format(new Date(row.getValue("date_created")), "MMM d, yyyy"),
    },
    {
      accessorKey: "vendor",
      header: "Vendor",
    },
  ];

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name || !newExpense.type || !newExpense.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("No auth token");

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.EXPENSES.CREATE}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newExpense,
            branch_id: user?.branch_id,
            scope: ExpenseScope.BRANCH,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", errorData);
        throw new Error("Failed to create expense");
      }

      await fetchData(); // Refresh the data
      setIsDialogOpen(false);
      setNewExpense({
        name: "",
        type: ExpenseType.UTILITIES,
        amount: 0,
        description: "",
        vendor: "",
        scope: ExpenseScope.BRANCH,
        branch_id: user?.branch_id || null,
        date_created: format(new Date(), "yyyy-MM-dd"),
      });

      toast.success("Expense created successfully");
    } catch (error) {
      console.error("Error creating expense:", error);
      toast.error("Failed to create expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted/40">
      <SideNavBar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      <Label htmlFor="vendor" className="text-right">
                        Vendor
                      </Label>
                      <Input
                        id="vendor"
                        value={newExpense.vendor || ""}
                        onChange={(e) =>
                          setNewExpense({
                            ...newExpense,
                            vendor: e.target.value,
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
                  {analytics?.highest_category || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.highest_category_percentage?.toFixed(1)}% of total
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
                  {analytics?.last_expense_date
                    ? format(new Date(analytics.last_expense_date), "MMM d")
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.last_expense_date
                    ? formatDistanceToNow(
                        new Date(analytics.last_expense_date),
                        { addSuffix: true }
                      )
                    : "N/A"}
                </p>
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
                filterColumn="type"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
