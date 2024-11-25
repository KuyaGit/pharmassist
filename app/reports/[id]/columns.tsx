"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";

export type ReportItem = {
  id: number;
  product_id: number;
  product_name: string;
  beginning: number;
  offtake: number;
  selling_area: number;
  current_cost: number;
  current_srp: number;
  deliver: number;
  transfer: number;
  pull_out: number;
  peso_value: number;
};

export const columns: ColumnDef<ReportItem>[] = [
  {
    accessorKey: "product_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
  },
  {
    accessorKey: "current_srp",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="SRP" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("current_srp"));
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);
    },
  },
  {
    accessorKey: "beginning",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Beginning" />
    ),
  },
  {
    accessorKey: "deliver",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deliveries" />
    ),
  },
  {
    accessorKey: "transfer",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Transfers" />
    ),
  },
  {
    accessorKey: "pull_out",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pull Outs" />
    ),
  },
  {
    accessorKey: "offtake",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Offtake" />
    ),
  },
  {
    accessorKey: "selling_area",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Selling Area" />
    ),
  },
  {
    accessorKey: "peso_value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Peso Value" />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("peso_value"));
      return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(amount);
    },
  },
];
