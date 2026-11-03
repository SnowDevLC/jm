"use client";

import { ColumnDef } from "@tanstack/react-table";
import { NotebookTabs, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DataTableColumnHeader } from "@/components/ui/datatable-columnheader";
import { useState } from "react";
import { DepositType } from "../lib/zodDeposits";
import { deleteDeposit } from "../actions/actionsDeposits";
import Link from "next/link";
import FormDeposit from "./FormDeposit";
import { toast } from "@/components/ui/toast";

//MODIFICACION PARA ACEPTAR OTRO ATRIBUTO, HACIENDO UNA EXTENSION
type CustomColumnDef<T> = ColumnDef<T> & { headerTitle?: string };

export const columns: CustomColumnDef<DepositType>[] = [
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
    id: "actions",
    cell: ({ row }) => {
      const deposit = row.original;

      const [openModalUpdate, setOpenModalUpdate] = useState(false);
      const [openModalDelete, setOpenModalDelete] = useState(false);
      const [openModalMenu, setOpenModalMenu] = useState(false);

      const handleDelete = async (id: string) => {
        const response = await deleteDeposit(id);
        if (response.success) {
          toast.add({
            type: "success",
            title: "Depósito eliminado",
            description: "Ya no se encuentra en el sistema.",
          })
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
            <DropdownMenuItem>
              <Link href={`/dashboard/deposits/${deposit.id}`} className="flex gap-2 items-center">
                <NotebookTabs className="w-4 h-4" />
                Detalles
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Dialog open={openModalUpdate} onOpenChange={setOpenModalUpdate}>
              <DialogTrigger>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Editar</DialogTitle>
                <FormDeposit
                  setOpenModalForm={setOpenModalUpdate}
                  deposit={deposit}
                  setOpenModalMenu={setOpenModalMenu}
                />
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
                <DialogDescription>Confirma borrar depósito: {deposit.name}</DialogDescription>
                <Button variant="destructive" onClick={() => handleDelete(deposit.id)}>
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
