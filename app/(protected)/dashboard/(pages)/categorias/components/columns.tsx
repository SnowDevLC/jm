"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
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

import FormCategory from "./FormCategory";
import { CategoryType } from "../lib/zodCategories";
import { deleteCategory } from "../actions/actionsCategories";

//MODIFICACION PARA ACEPTAR OTRO ATRIBUTO, HACIENDO UNA EXTENSION
type CustomColumnDef<T> = ColumnDef<T> & { headerTitle?: string };

export const columns: CustomColumnDef<CategoryType>[] = [
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
      const category = row.original;

      const [openModalUpdate, setOpenModalUpdate] = useState(false);
      const [openModalDelete, setOpenModalDelete] = useState(false);
      const [openModalMenu, setOpenModalMenu] = useState(false);

      const handleDelete = async (id: string) => {
        const response = await deleteCategory(id);
        if (response.success) {
          toast.add({
            type: "success",
            title: "Categoria eliminada",
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
              <DialogTitle>Editar categoría</DialogTitle>
              <DialogDescription className="sr-only">
                Formulario para editar la categoría {category.name}
              </DialogDescription>
              <FormCategory
                setOpenModalForm={setOpenModalUpdate}
                category={category}
                setOpenModalMenu={setOpenModalMenu}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={openModalDelete} onOpenChange={setOpenModalDelete}>
            <DialogContent>
              <DialogTitle>Borrar categoría</DialogTitle>
              <DialogDescription>¿Confirma borrar la categoría: {category.name}?</DialogDescription>
              <Button variant="destructive" onClick={() => handleDelete(category.id)}>
                Borrar
              </Button>
            </DialogContent>
          </Dialog>
        </>
      );
    },
  },
];
