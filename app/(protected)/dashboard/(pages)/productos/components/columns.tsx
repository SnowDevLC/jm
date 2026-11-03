"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash, ScanBarcode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/datatable-columnheader";
import { ProductType } from "../lib/zodProducts";
import { useState } from "react";
import { deleteProduct, getProductById } from "../actions/actionsProducts";
import { toast } from "@/components/ui/toast";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import FormProduct from "./FormProduct";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";

//MODIFICACION PARA ACEPTAR OTRO ATRIBUTO, HACIENDO UNA EXTENSION
type CustomColumnDef<T> = ColumnDef<T> & {
  headerTitle?: string;
  enableFaceting?: boolean;
  enableColumnFilter?: boolean;
  enableHiding?: boolean;
};

export const columns: CustomColumnDef<ProductType>[] = [
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
    id: "categories",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Categorías" />,
    cell: ({ row }) => <div className="font-medium">{row.original.categories.map((c) => c.name).join(", ")}</div>,
    filterFn: (row, id, value) => {
      const categories = row.original.categories.map((c) => c.name);
      return categories.some((c) => value.includes(c));
    },
  },
  {
    accessorKey: "cost",
    headerTitle: "Costo $",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Costo $" />;
    },
    cell: ({ row }) => {
      const amount = Number(row.getValue("cost"));
      const formatted = formatCurrency(amount);

      return <div className="font-medium">{amount === 0 ? "-" : formatted}</div>;
    },
  },
  {
    accessorFn: (row) => row.priceLists[0].price,
    accessorKey: "defaultPrice",
    headerTitle: "Precio Lista Base $",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Precio Lista Base $" />;
    },
    cell: ({ row }) => {
      const amount = Number(row.getValue("defaultPrice"));
      const formatted = formatCurrency(amount);

      return <div className="font-medium">{amount === 0 ? "-" : formatted}</div>;
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

      const [openModalUpdate, setOpenModalUpdate] = useState(false);
      const [openModalDelete, setOpenModalDelete] = useState(false);
      const [openModalMenu, setOpenModalMenu] = useState(false);
      const [productToEdit, setProductToEdit] = useState<ProductType | null>(null);

      const [loading, setLoading] = useState(false);

      const { data: session } = useSession();

      if (!session) {
        return;
      }

      const handleDelete = async (id: string) => {
        const response = await deleteProduct(id);
        if (response.success) {
          toast.add({
            type: "success",
            title: "Producto eliminado",
            description: "Ya no se encuentra en el sistema.",
          });
          setOpenModalDelete(false);
          setOpenModalMenu(false);
        } else {
          toast.add({
            type: "error",
            title: "Algo salió mal",
            description: "Intenta nuevamente más tarde.",
            priority: "high",
          });
        }
      };

      const handleEdit = async () => {
        setLoading(true);
        setOpenModalUpdate(true);

        try {
          const response = await getProductById(product.id);
          if (response !== null) {
            setProductToEdit(response);
          } else {
            setOpenModalUpdate(false);
            toast.add({
              type: "error",
              title: "No se pudo obtener el producto",
              description: "Intenta nuevamente más tarde.",
            });
          }
        } catch {
          setOpenModalUpdate(false);
          toast.add({
            type: "error",
            title: "Error al cargar el producto",
            description: "Intenta nuevamente más tarde.",
          });
        } finally {
          setLoading(false);
        }
      };

      return (
        <>
          <DropdownMenu open={openModalMenu} onOpenChange={setOpenModalMenu}>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                render={<Link href={`/dashboard/productos/${product.id}`} className="flex items-center gap-2" />}
              >
                <ScanBarcode className="h-4 w-4" />
                Detalles
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setOpenModalMenu(false);
                  setOpenModalDelete(true);
                }}
              >
                <Trash className="mr-2 h-4 w-4" />
                Borrar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={openModalUpdate} onOpenChange={setOpenModalUpdate}>
            <DialogContent className="sm:max-w-156.25 max-h-[90%] overflow-auto">
              <DialogTitle>Editar</DialogTitle>

              <DialogDescription className="sr-only">Editar producto {product.name}</DialogDescription>

              {loading ? (
                <p>Cargando producto...</p>
              ) : productToEdit ? (
                <FormProduct
                  key={productToEdit.id}
                  setOpenModalForm={setOpenModalUpdate}
                  product={productToEdit}
                  setOpenModalMenu={setOpenModalMenu}
                  session={session}
                />
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog open={openModalDelete} onOpenChange={setOpenModalDelete}>
            <DialogContent>
              <DialogTitle>Borrar</DialogTitle>

              <DialogDescription>Confirma borrar producto: {product.name}</DialogDescription>

              <Button variant="destructive" onClick={() => handleDelete(product.id)}>
                Borrar
              </Button>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
