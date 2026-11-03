"use client";

import { ColumnDef } from "@tanstack/react-table";
import { BookUserIcon, MoreHorizontal, Pencil, Trash } from "lucide-react";
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
import { toast } from "@/components/ui/toast"
import { useState } from "react";
import Link from "next/link";
import { ExchangeRateTypeType } from "../lib/zodConfig";

//MODIFICACION PARA ACEPTAR OTRO ATRIBUTO, HACIENDO UNA EXTENSION
type CustomColumnDef<T> = ColumnDef<T> & { headerTitle?: string };

export const columnsExchangeRateTypes: CustomColumnDef<ExchangeRateTypeType>[] = [
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
    accessorKey: "source",
    headerTitle: "Tipo",
    header: ({ column }) => {
      return <DataTableColumnHeader column={column} title="Tipo" />;
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("source")}</div>;
    },
  },
  
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;

      const [openModalUpdate, setOpenModalUpdate] = useState(false);
      const [openModalDelete, setOpenModalDelete] = useState(false);
      const [openModalMenu, setOpenModalMenu] = useState(false);

      // const [clientToEdit, setClientToEdit] = useState<ClientType | null>(null);

      // const [loading, setLoading] = useState(false);

      // const handleDelete = async (id: string) => {
      //   const response = await deleteClient(id);
      //   if (response.success) {
      //   toast.add({
      //     type: "success",
      //     title: "Cliente eliminado",
      //     description: "Ya no se encuentra en el sistema.",
      //   });
      //     setOpenModalDelete(false);
      //     setOpenModalMenu(false);
      //   } else {
      //   toast.add({
      //     type: "error",
      //     title: "Algo salió mal",
      //     description: "Intenta nuevamente más tarde.",
      //     priority: "high",
      //   })
      //   }
      // };

      // const handleEdit = async () => {
      //   setLoading(true);
      //   setOpenModalUpdate(true);

      //   try {
      //     const response = await getClientById(client.id);
      //     if (response !== null) {
      //       setClientToEdit(response);
      //     } else {
      //       setOpenModalUpdate(false);
      //       toast.add({
      //         type: "error",
      //         title: "No se pudo obtener el cliente",
      //         description: "Intenta nuevamente más tarde.",
      //       });
      //     }
      //   } catch {
      //     setOpenModalUpdate(false);
      //     toast.add({
      //       type: "error",
      //       title: "Error al cargar el cliente",
      //       description: "Intenta nuevamente más tarde.",
      //     });
      //   } finally {
      //     setLoading(false);
      //   }
      // };

      return (
        <>
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
              <DropdownMenuItem
                render={<Link href={`/dashboard/clientes/${client.id}`} className="flex items-center gap-2" />}
              >
                <BookUserIcon className="w-4 h-4" />
                Detalles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem> */}
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

          {/* <Dialog open={openModalUpdate} onOpenChange={setOpenModalUpdate}>
            <DialogContent className="sm:max-w-156.25 max-h-[90%] overflow-auto">
              <DialogTitle>Editar</DialogTitle>

              <DialogDescription className="sr-only">Editar Cliente {client.name}</DialogDescription>

              {loading ? (
                <p>Cargando cliente...</p>
              ) : clientToEdit ? (
                <FormClient
                  key={clientToEdit.id}
                  setOpenModalForm={setOpenModalUpdate}
                  client={clientToEdit}
                  setOpenModalMenu={setOpenModalMenu}
                />
              ) : null}
            </DialogContent>
          </Dialog>

          <Dialog open={openModalDelete} onOpenChange={setOpenModalDelete}>
            <DialogContent>
              <DialogTitle>Borrar</DialogTitle>

              <DialogDescription>Confirma borrar cliente: {client.name}</DialogDescription>

              <Button variant="destructive" onClick={() => handleDelete(client.id)}>
                Borrar
              </Button>
            </DialogContent>
          </Dialog> */}
        </>
      );
    },
  },
];
