"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/datatable-columnheader";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { useState } from "react";
import { BrandType } from "../lib/zodBrands";
import { deleteBrand } from "../actions/actionsBrands";
import FormBrand from "./FormBrand";

//MODIFICACION PARA ACEPTAR OTRO ATRIBUTO, HACIENDO UNA EXTENSION
type CustomColumnDef<T> = ColumnDef<T> & { headerTitle?: string };

export const columns: CustomColumnDef<BrandType>[] = [
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
    id: "actions",
    cell: ({ row }) => {
      const brand = row.original;

      const [openModalUpdate, setOpenModalUpdate] = useState(false);
      const [openModalDelete, setOpenModalDelete] = useState(false);
      const [openModalMenu, setOpenModalMenu] = useState(false);

      const handleDelete = async (id: string) => {
        const response = await deleteBrand(id);
        if (response.success) {
          toast.add({
            type: "success",
            title: "Marca eliminada",
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
        <DropdownMenu open={openModalMenu} onOpenChange={setOpenModalMenu}>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir Menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <Dialog open={openModalUpdate} onOpenChange={setOpenModalUpdate}>
              <DialogTrigger>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Editar</DialogTitle>
                <DialogDescription className="sr-only"></DialogDescription>
                <FormBrand setOpenModalForm={setOpenModalUpdate} brand={brand} setOpenModalMenu={setOpenModalMenu} />
              </DialogContent>
            </Dialog>
            <Dialog open={openModalDelete} onOpenChange={setOpenModalDelete}>
              <DialogTrigger>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Trash className="w-4 h-4 mr-2" />
                  Borrar
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Borrar</DialogTitle>
                <DialogDescription>Confirma borrar marca: {brand.name}</DialogDescription>
                <Button variant="destructive" onClick={() => handleDelete(brand.id)}>
                  Borrar
                </Button>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
