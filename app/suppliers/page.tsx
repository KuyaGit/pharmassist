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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { DataTable } from "@/components/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faPhone,
  faEnvelope,
  faCalendarAlt,
  faPencil,
  faTrash,
  faEye,
  faBan,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/api-config";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

interface Supplier {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSupplier, setNewSupplier] = useState<{
    name: string;
    contact_person: string;
    phone: string;
    email: string;
    address: string;
    notes: string;
    is_active: boolean;
  }>({
    name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    is_active: true,
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [selectedSupplierForView, setSelectedSupplierForView] =
    useState<Supplier | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "contact_person",
      header: "Contact Person",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("is_active") ? "success" : "secondary"}>
          {row.getValue("is_active") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SUPPLIERS.LIST}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to fetch suppliers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const supplierData = {
        name: newSupplier.name.trim(),
        contact_person: newSupplier.contact_person?.trim() || null,
        phone: newSupplier.phone?.trim() || null,
        email: newSupplier.email?.trim() || null,
        address: newSupplier.address?.trim() || null,
        notes: newSupplier.notes?.trim() || null,
        is_active: newSupplier.is_active,
      };

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SUPPLIERS.CREATE}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(supplierData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        throw new Error(
          errorData.detail?.[0]?.msg || "Failed to create supplier"
        );
      }

      await fetchSuppliers();
      setIsDialogOpen(false);
      setNewSupplier({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        notes: "",
        is_active: true,
      });
      toast.success("Supplier created successfully");
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create supplier"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!supplierToDelete) return;
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SUPPLIERS.DELETE(supplierToDelete.id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete supplier");
      await fetchSuppliers();
      toast.success("Supplier deleted successfully");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
    } finally {
      setIsDeleteAlertOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    setIsSubmitting(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const updateData = {
        name: selectedSupplier.name,
        contact_person: selectedSupplier.contact_person,
        phone: selectedSupplier.phone,
        email: selectedSupplier.email,
        address: selectedSupplier.address,
        notes: selectedSupplier.notes,
        is_active: selectedSupplier.is_active,
      };

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SUPPLIERS.UPDATE(selectedSupplier.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error("Failed to update supplier");
      await fetchSuppliers();
      setIsEditDialogOpen(false);
      setSelectedSupplier(null);
      toast.success("Supplier updated successfully");
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplierForView(supplier);
    setIsViewDialogOpen(true);
  };

  const handleToggleStatus = async (supplier: Supplier) => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.SUPPLIERS.UPDATE(supplier.id)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_active: !supplier.is_active,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to toggle supplier status");
      await fetchSuppliers();
      const updatedSupplier = { ...supplier, is_active: !supplier.is_active };
      setSelectedSupplierForView(updatedSupplier);
      toast.success(
        `Supplier ${
          supplier.is_active ? "deactivated" : "activated"
        } successfully`
      );
    } catch (error) {
      console.error("Error toggling supplier status:", error);
      toast.error("Failed to toggle supplier status");
    }
  };

  return (
    <div className="flex min-h-screen">
      <SideNavBar />
      <div className="flex-1">
        <TopBar />
        <main className="p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Suppliers</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add Supplier</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                  <DialogDescription>
                    Fill in the supplier details below. Required fields are
                    marked with *.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newSupplier.name}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            name: e.target.value,
                          })
                        }
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="contact_person" className="text-right">
                        Contact Person
                      </Label>
                      <Input
                        id="contact_person"
                        value={newSupplier.contact_person || ""}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            contact_person: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={newSupplier.phone || ""}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            phone: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={newSupplier.email || ""}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            email: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="address" className="text-right">
                        Address
                      </Label>
                      <Input
                        id="address"
                        value={newSupplier.address || ""}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            address: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Status
                      </Label>
                      <div className="flex items-center space-x-2 col-span-3">
                        <Switch
                          id="status"
                          checked={newSupplier.is_active}
                          onCheckedChange={(checked) =>
                            setNewSupplier({
                              ...newSupplier,
                              is_active: checked,
                            })
                          }
                          className="data-[state=checked]:bg-success"
                        />
                        <Label htmlFor="status" className="text-sm">
                          {newSupplier.is_active ? "Active" : "Inactive"}
                        </Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="notes" className="text-right pt-2">
                        Notes
                      </Label>
                      <textarea
                        id="notes"
                        value={newSupplier.notes || ""}
                        onChange={(e) =>
                          setNewSupplier({
                            ...newSupplier,
                            notes: e.target.value,
                          })
                        }
                        className="col-span-3 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Supplier List</CardTitle>
              <CardDescription>A list of all suppliers</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={suppliers}
                enableFiltering={true}
                filterColumn={["name", "contact_person"]}
                filterPlaceholder="Search by name or contact person..."
                onRowClick={(row) => handleView(row)}
                contextMenuOptions={(row: Supplier) => [
                  {
                    label: "View Details",
                    icon: (
                      <FontAwesomeIcon icon={faEye} className="mr-2 h-4 w-4" />
                    ),
                    onClick: () => handleView(row),
                  },
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
                    label: row.is_active ? "Deactivate" : "Activate",
                    icon: (
                      <FontAwesomeIcon
                        icon={row.is_active ? faBan : faCheck}
                        className="mr-2 h-4 w-4"
                      />
                    ),
                    onClick: () => handleToggleStatus(row),
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
                  This will permanently delete supplier "
                  {supplierToDelete?.name}" and remove it from the database.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Supplier
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Supplier</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="edit-name"
                      value={selectedSupplier?.name || ""}
                      onChange={(e) =>
                        setSelectedSupplier(
                          selectedSupplier
                            ? { ...selectedSupplier, name: e.target.value }
                            : null
                        )
                      }
                      className="col-span-3"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-contact-person" className="text-right">
                      Contact Person
                    </Label>
                    <Input
                      id="edit-contact-person"
                      value={selectedSupplier?.contact_person || ""}
                      onChange={(e) =>
                        setSelectedSupplier(
                          selectedSupplier
                            ? {
                                ...selectedSupplier,
                                contact_person: e.target.value,
                              }
                            : null
                        )
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-phone" className="text-right">
                      Phone
                    </Label>
                    <Input
                      id="edit-phone"
                      value={selectedSupplier?.phone || ""}
                      onChange={(e) =>
                        setSelectedSupplier(
                          selectedSupplier
                            ? { ...selectedSupplier, phone: e.target.value }
                            : null
                        )
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-email" className="text-right">
                      Email (Optional)
                    </Label>
                    <Input
                      id="edit-email"
                      value={selectedSupplier?.email || ""}
                      onChange={(e) =>
                        setSelectedSupplier(
                          selectedSupplier
                            ? { ...selectedSupplier, email: e.target.value }
                            : null
                        )
                      }
                      className="col-span-3"
                      placeholder="Enter email (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-address" className="text-right">
                      Address
                    </Label>
                    <Input
                      id="edit-address"
                      value={selectedSupplier?.address || ""}
                      onChange={(e) =>
                        setSelectedSupplier(
                          selectedSupplier
                            ? { ...selectedSupplier, address: e.target.value }
                            : null
                        )
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="edit-notes" className="text-right pt-2">
                      Notes
                    </Label>
                    <textarea
                      id="edit-notes"
                      value={selectedSupplier?.notes || ""}
                      onChange={(e) =>
                        setSelectedSupplier(
                          selectedSupplier
                            ? { ...selectedSupplier, notes: e.target.value }
                            : null
                        )
                      }
                      className="col-span-3 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Supplier Details</DialogTitle>
              </DialogHeader>
              {selectedSupplierForView && (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedSupplierForView.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Created:{" "}
                        {format(
                          new Date(selectedSupplierForView.created_at),
                          "MMM d, yyyy"
                        )}{" "}
                        at{" "}
                        <span className="font-medium">
                          {format(
                            new Date(selectedSupplierForView.created_at),
                            "h:mm a"
                          )}
                        </span>
                      </p>
                      {selectedSupplierForView.updated_at && (
                        <p className="text-sm text-muted-foreground">
                          Updated:{" "}
                          {format(
                            new Date(selectedSupplierForView.updated_at),
                            "MMM d, yyyy"
                          )}{" "}
                          at{" "}
                          <span className="font-medium">
                            {format(
                              new Date(selectedSupplierForView.updated_at),
                              "h:mm a"
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="status-toggle"
                        checked={selectedSupplierForView.is_active}
                        onCheckedChange={() =>
                          handleToggleStatus(selectedSupplierForView)
                        }
                        className="data-[state=checked]:bg-success"
                      />
                      <Label htmlFor="status-toggle" className="text-sm">
                        {selectedSupplierForView.is_active
                          ? "Active"
                          : "Inactive"}
                      </Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">
                        Contact Person
                      </Label>
                      <p className="text-sm font-medium pl-4">
                        {selectedSupplierForView.contact_person || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">
                        Phone
                      </Label>
                      <p className="text-sm font-medium pl-4">
                        {selectedSupplierForView.phone || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">
                        Email
                      </Label>
                      <p className="text-sm font-medium pl-4">
                        {selectedSupplierForView.email || "N/A"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground text-sm">
                        Address
                      </Label>
                      <p className="text-sm font-medium pl-4">
                        {selectedSupplierForView.address || "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label className="text-muted-foreground text-sm">
                        Notes
                      </Label>
                      <p className="text-sm font-medium pl-4 whitespace-pre-wrap">
                        {selectedSupplierForView.notes || "N/A"}
                      </p>
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
