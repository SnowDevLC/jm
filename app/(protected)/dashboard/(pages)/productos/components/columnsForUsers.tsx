"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/datatable-columnheader";
import { ProductType } from "../lib/zodProducts";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StockPerDeposit from "./StockPerDeposit";

//MODIFICACION PARA ACEPTAR OTRO ATRIBUTO, HACIENDO UNA EXTENSION
type CustomColumnDef<T> = ColumnDef<T> & { headerTitle?: string };

export const columnsForUsers: CustomColumnDef<ProductType>[] = [
  {
    accessorKey: "name",
    headerTitle: "Nombre",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Nombre" />;
    },
    cell: ({ row }) => {
      return <div className="font-semibold">{row.original.name}</div>;
    },
  },
  {
    accessorKey: "SKU",
    headerTitle: "SKU",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="SKU" />;
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.SKU === null ? "-" : row.original.SKU}</div>;
    },
  },
  {
    accessorKey: "barcode",
    headerTitle: "Código de Barras",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Código de Barras" />;
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.original.barcode === null ? "-" : row.original.barcode}</div>;
    },
  },
  {
    accessorFn: (row) => row.brand.name,
    accessorKey: "brand",
    headerTitle: "Marca",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Marca" />;
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("brand")}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "price",
    headerTitle: "Precio $",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Precio $" />;
    },
    cell: ({ row }) => {
      const amount = Number(row.getValue("price"));
      const formatted = new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
      }).format(amount);

      return <div className="font-medium">{formatted}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "totalStock",
    headerTitle: "Stock",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Stock" />;
    },
    cell: ({ row }) => {
      const stockTotal = Number(row.getValue("totalStock"));

      const colorClass = stockTotal < 5 ? "text-red-500" : "text-green-500";

      return <div className={`w-12.5 font-medium ${colorClass}`}>{stockTotal}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row.original;

      const [openModalStock, setOpenModalStock] = useState(false);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <Dialog open={openModalStock} onOpenChange={setOpenModalStock}>
              <DialogTrigger
                render={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <PackageSearch className="w-4 h-4 mr-2" />
                    Stock por Depósito
                  </DropdownMenuItem>
                }
              />
              <DialogContent initialFocus={false}>
                <DialogTitle>Stock por Depósito</DialogTitle>
                <StockPerDeposit product={product} />
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
