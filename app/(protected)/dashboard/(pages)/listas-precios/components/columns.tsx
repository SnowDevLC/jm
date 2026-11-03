"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Check, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/datatable-columnheader";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { MARGINS_TYPES, PricesListType } from "../lib/zodPricesLists";
import { deletePricesList } from "../actions/actionsPricesLists";
import FormPricesList from "./FormPricesList";
import { formatCurrency } from "@/lib/utils";

//MODIFICACION PARA ACEPTAR OTRO ATRIBUTO, HACIENDO UNA EXTENSION
type CustomColumnDef<T> = ColumnDef<T> & { headerTitle?: string };

export const columns: CustomColumnDef<PricesListType>[] = [
  {
    accessorKey: "name",
    headerTitle: "Nombre",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Nombre" />;
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("name")}</div>;
    },
  },
  {
    accessorKey: "description",
    headerTitle: "Descripción",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Descripción" />;
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("description")}</div>;
    },
  },
  {
    accessorKey: "marginType",
    headerTitle: "Tipo de Margen",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Tipo de Margen" />;
    },
    cell: ({ row }) => {
      return <div className="font-medium">{MARGINS_TYPES[row.original.marginType].label}</div>;
    },
  },
  {
    accessorKey: "marginValue",
    headerTitle: "Valor de Margen",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Valor de Margen" />;
    },
    cell: ({ row }) => {
      const { marginType, marginValue } = row.original;

      let value = "-";

      if (marginType === "PERCENTAGE") {
        value = `${Number(marginValue)} %`;
      } else if (marginType === "FIXED") {
        value = formatCurrency(marginValue);
      }

      return <div className="font-medium">{value}</div>;
    },
  },
  {
    accessorKey: "isDefault",
    headerTitle: "Default",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Default" />;
    },
    cell: ({ row }) => {
      const isDefault = row.original.isDefault;
      return <div className="font-medium">{isDefault ? <Check /> : ""}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const pricesList = row.original;

      const [openModalUpdate, setOpenModalUpdate] = useState(false);
      const [openModalDelete, setOpenModalDelete] = useState(false);
      const [openModalMenu, setOpenModalMenu] = useState(false);

      const handleDelete = async (id: string) => {
        const response = await deletePricesList(id);
        if (response.success) {
          toast.add({
            type: "success",
            title: "Lista de Precios eliminada",
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
                onClick={() => {
                  setOpenModalMenu(false);
                  setOpenModalUpdate(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
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
            <DialogContent>
              <DialogTitle>Editar Lista de Precios</DialogTitle>
              <DialogDescription className="sr-only">
                Formulario para editar la Lista de Precios {pricesList.name}
              </DialogDescription>
              <FormPricesList
                setOpenModalForm={setOpenModalUpdate}
                pricesList={pricesList}
                setOpenModalMenu={setOpenModalMenu}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={openModalDelete} onOpenChange={setOpenModalDelete}>
            <DialogContent>
              <DialogTitle>Borrar Lista de Precios</DialogTitle>
              <DialogDescription>¿Confirma borrar la Lista de Precios: {pricesList.name}?</DialogDescription>
              <Button variant="destructive" onClick={() => handleDelete(pricesList.id)}>
                Borrar
              </Button>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
