"use client";

import { useState, useEffect } from "react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxes, faTag, faChartLine } from "@fortawesome/free-solid-svg-icons";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
} from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

interface Product {
  id: number;
  name: string;
  cost: number;
  srp: number;
  retail_low_stock_threshold: number;
  wholesale_low_stock_threshold: number;
  is_retail_available: boolean;
  is_wholesale_available: boolean;
}

interface NewProduct {
  name: string;
  cost: number;
  srp: number;
  retail_low_stock_threshold: number;
  wholesale_low_stock_threshold: number;
  is_retail_available: boolean;
  is_wholesale_available: boolean;
}

const showToast = (message: string, type: "success" | "error" | "warning") => {
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

export default function Products() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState<NewProduct>({
    name: "",
    cost: 0,
    srp: 0,
    retail_low_stock_threshold: 50,
    wholesale_low_stock_threshold: 50,
    is_retail_available: true,
    is_wholesale_available: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.LIST}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showToast("Failed to fetch products", "error");
      console.error(error);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.CREATE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newProduct),
        }
      );

      if (!response.ok) throw new Error("Failed to add product");

      await fetchProducts();
      setIsDialogOpen(false);
      setNewProduct({
        name: "",
        cost: 0,
        srp: 0,
        retail_low_stock_threshold: 50,
        wholesale_low_stock_threshold: 50,
        is_retail_available: true,
        is_wholesale_available: false,
      });
      showToast("Product added successfully", "success");
    } catch (error) {
      showToast("Failed to add product", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div>{row.getValue("name")}</div>,
    },
    {
      accessorKey: "cost",
      header: ({ column }) => <div className="text-right">Cost</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
          }).format(row.getValue("cost"))}
        </div>
      ),
    },
    {
      accessorKey: "srp",
      header: ({ column }) => <div className="text-right">SRP</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
          }).format(row.getValue("srp"))}
        </div>
      ),
    },
    {
      accessorKey: "retail_low_stock_threshold",
      header: "Retail Threshold",
    },
    {
      accessorKey: "wholesale_low_stock_threshold",
      header: "Wholesale Threshold",
    },
    {
      accessorKey: "is_retail_available",
      header: "Retail",
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue("is_retail_available") ? "success" : "secondary"
          }
        >
          {row.getValue("is_retail_available") ? "Available" : "Unavailable"}
        </Badge>
      ),
    },
    {
      accessorKey: "is_wholesale_available",
      header: "Wholesale",
      cell: ({ row }) => (
        <Badge
          variant={
            row.getValue("is_wholesale_available") ? "success" : "secondary"
          }
        >
          {row.getValue("is_wholesale_available") ? "Available" : "Unavailable"}
        </Badge>
      ),
    },
  ];

  const handleView = (product: Product) => {
    // TODO: Implement view logic
    console.log("View product:", product);
  };

  const handleEdit = async (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsLoading(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.UPDATE(selectedProduct.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(selectedProduct),
        }
      );

      if (!response.ok) throw new Error("Failed to update product");

      await fetchProducts();
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
      showToast("Product updated successfully", "success");
    } catch (error) {
      showToast("Failed to update product", "error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/products/${productToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle the specific case where product is active in branches
        if (response.status === 400) {
          throw new Error(
            "Cannot delete product while it is active in branches. Please remove it from all branches first."
          );
        }
        throw new Error(data.detail || "Failed to delete product");
      }

      await fetchProducts();
      showToast("Product deleted successfully", "success");
    } catch (error: any) {
      showToast(error.message, "error");
      console.error(error);
    } finally {
      setIsDeleteAlertOpen(false);
      setProductToDelete(null);
    }
  };

  const contextOptions = (row: Product) => [
    {
      label: "View Details",
      onClick: () => handleView(row),
      icon: <Eye className="h-4 w-4" />,
      variant: "default" as const,
    },
    {
      label: "Edit",
      onClick: () => handleEdit(row),
      icon: <Pencil className="h-4 w-4" />,
      variant: "default" as const,
    },
    {
      label: "Delete",
      onClick: () => handleDelete(row),
      icon: <Trash2 className="h-4 w-4" />,
      variant: "danger" as const,
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
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleAddProduct}>
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
                      <Input
                        id="name"
                        className="col-span-3"
                        value={newProduct.name}
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="cost" className="text-right">
                        Cost
                      </Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={newProduct.cost}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            cost: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="srp" className="text-right">
                        SRP
                      </Label>
                      <Input
                        id="srp"
                        type="number"
                        step="0.01"
                        className="col-span-3"
                        value={newProduct.srp}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            srp: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="retail_threshold" className="text-right">
                        Retail Low Stock Threshold
                      </Label>
                      <Input
                        id="retail_threshold"
                        type="number"
                        className="col-span-3"
                        value={newProduct.retail_low_stock_threshold}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            retail_low_stock_threshold: parseInt(
                              e.target.value
                            ),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label
                        htmlFor="wholesale_threshold"
                        className="text-right"
                      >
                        Wholesale Low Stock Threshold
                      </Label>
                      <Input
                        id="wholesale_threshold"
                        type="number"
                        className="col-span-3"
                        value={newProduct.wholesale_low_stock_threshold}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            wholesale_low_stock_threshold: parseInt(
                              e.target.value
                            ),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Availability</Label>
                      <div className="col-span-3 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="retail"
                            checked={newProduct.is_retail_available}
                            onCheckedChange={(checked) =>
                              setNewProduct({
                                ...newProduct,
                                is_retail_available: checked as boolean,
                              })
                            }
                          />
                          <Label htmlFor="retail">Retail Available</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="wholesale"
                            checked={newProduct.is_wholesale_available}
                            onCheckedChange={(checked) =>
                              setNewProduct({
                                ...newProduct,
                                is_wholesale_available: checked as boolean,
                              })
                            }
                          />
                          <Label htmlFor="wholesale">Wholesale Available</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Adding..." : "Save Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

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
                <div className="text-2xl font-bold">{products.length}</div>
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
                    currency: "PHP",
                  }).format(
                    products.reduce((acc, product) => acc + product.srp, 0) /
                      products.length || 0
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
                    (products.reduce(
                      (sum, product) =>
                        sum + (product.srp - product.cost) / product.srp,
                      0
                    ) / products.length || 0) * 100
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
                  Retail Products
                </CardTitle>
                <FontAwesomeIcon icon={faTag} size="2x" className="text-icon" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    products.filter((product) => product.is_retail_available)
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Products available for retail
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
                data={products}
                contextMenuOptions={contextOptions}
                enableFiltering
                enableSorting
                enableColumnVisibility
                filterColumn={["name"]}
                filterPlaceholder="Search by product name..."
              />
            </CardContent>
          </Card>
        </main>
        <AlertDialog
          open={isDeleteAlertOpen}
          onOpenChange={setIsDeleteAlertOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{productToDelete?.name}&quot;
                and remove it from the database. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <form onSubmit={handleEditSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>
                  Make changes to the product here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    className="col-span-3"
                    value={selectedProduct?.name || ""}
                    onChange={(e) =>
                      setSelectedProduct(
                        selectedProduct
                          ? { ...selectedProduct, name: e.target.value }
                          : null
                      )
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-cost" className="text-right">
                    Cost
                  </Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    value={selectedProduct?.cost || 0}
                    onChange={(e) =>
                      setSelectedProduct(
                        selectedProduct
                          ? {
                              ...selectedProduct,
                              cost: parseFloat(e.target.value),
                            }
                          : null
                      )
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-srp" className="text-right">
                    SRP
                  </Label>
                  <Input
                    id="edit-srp"
                    type="number"
                    step="0.01"
                    className="col-span-3"
                    value={selectedProduct?.srp || 0}
                    onChange={(e) =>
                      setSelectedProduct(
                        selectedProduct
                          ? {
                              ...selectedProduct,
                              srp: parseFloat(e.target.value),
                            }
                          : null
                      )
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-retail-threshold" className="text-right">
                    Retail Low Stock Threshold
                  </Label>
                  <Input
                    id="edit-retail-threshold"
                    type="number"
                    className="col-span-3"
                    value={selectedProduct?.retail_low_stock_threshold || 0}
                    onChange={(e) =>
                      setSelectedProduct(
                        selectedProduct
                          ? {
                              ...selectedProduct,
                              retail_low_stock_threshold: parseInt(
                                e.target.value
                              ),
                            }
                          : null
                      )
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label
                    htmlFor="edit-wholesale-threshold"
                    className="text-right"
                  >
                    Wholesale Low Stock Threshold
                  </Label>
                  <Input
                    id="edit-wholesale-threshold"
                    type="number"
                    className="col-span-3"
                    value={selectedProduct?.wholesale_low_stock_threshold || 0}
                    onChange={(e) =>
                      setSelectedProduct(
                        selectedProduct
                          ? {
                              ...selectedProduct,
                              wholesale_low_stock_threshold: parseInt(
                                e.target.value
                              ),
                            }
                          : null
                      )
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Availability</Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-retail"
                        checked={selectedProduct?.is_retail_available || false}
                        onCheckedChange={(checked) =>
                          setSelectedProduct(
                            selectedProduct
                              ? {
                                  ...selectedProduct,
                                  is_retail_available: checked as boolean,
                                }
                              : null
                          )
                        }
                      />
                      <Label htmlFor="edit-retail">Retail Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-wholesale"
                        checked={
                          selectedProduct?.is_wholesale_available || false
                        }
                        onCheckedChange={(checked) =>
                          setSelectedProduct(
                            selectedProduct
                              ? {
                                  ...selectedProduct,
                                  is_wholesale_available: checked as boolean,
                                }
                              : null
                          )
                        }
                      />
                      <Label htmlFor="edit-wholesale">
                        Wholesale Available
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
