"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CirclePlus, FileInput, FileOutput, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { HeaderProductsProps } from "../lib/zodProducts";
import { exportProductsToExcel } from "../lib/utilsProducts";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import FormProducts from "./FormProduct";
import FormProductsFromExcel from "./FormProductsFromExcel";
import FormProductsUpdateFromExcel from "./FormProductsUpdateFromExcel";

export default function HeaderProducts(props: HeaderProductsProps) {
  const { deposits, session } = props;
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalExcel, setOpenModalExcel] = useState(false);
  const [openModalUpdateExcel, setOpenModalUpdateExcel] = useState(false);

  const { isMobile } = useSidebar();

  return (
    <div className="sticky top-0 z-10 flex justify-end items-center bg-sidebar h-14 px-2 border-sidebar-border border-b">
      {isMobile && <SidebarTrigger className="absolute left-4" />}
      <h2 className="text-xl absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[50%]">
        Productos
      </h2>
      {(session.user.role === "ADMIN" || session.user.role === "SUPERADMIN") && (
        <div className="flex gap-2">
          <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
            <DialogTrigger
              render={
                <Button className="gap-x-2">
                  <CirclePlus />
                  Crear Producto
                </Button>
              }
            />
            <DialogContent className="sm:max-w-156 max-h-[90%] overflow-auto">
              <DialogHeader>
                <DialogTitle>Crear Producto</DialogTitle>
                <DialogDescription>Complete con los datos para crear un nuevo producto.</DialogDescription>
              </DialogHeader>
              <FormProducts setOpenModalForm={setOpenModalCreate} deposits={deposits} session={session} />
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button className="gap-x-2">
                  <FileSpreadsheet />
                  Excel
                </Button>
              }
            />
            <DropdownMenuContent className="flex flex-col gap-2 p-2">
              <Dialog open={openModalExcel} onOpenChange={setOpenModalExcel}>
                <DialogTrigger
                  render={
                    <Button className="gap-x-2">
                      <FileInput />
                      Cargar desde Excel
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-156">
                  <DialogHeader>
                    <DialogTitle>Cargar Excel</DialogTitle>
                    <DialogDescription>Seleccione un archivo excel para agregar productos.</DialogDescription>
                  </DialogHeader>
                  <FormProductsFromExcel setOpenModalForm={setOpenModalExcel} session={session} />
                </DialogContent>
              </Dialog>
              <Dialog open={openModalUpdateExcel} onOpenChange={setOpenModalUpdateExcel}>
                <DialogTrigger
                  render={
                    <Button className="gap-x-2">
                      <FileInput />
                      Actualizar desde Excel
                    </Button>
                  }
                />
                <DialogContent className="sm:max-w-156">
                  <DialogHeader>
                    <DialogTitle>Cargar Excel</DialogTitle>
                    <DialogDescription>Seleccione un archivo excel para actualizar productos.</DialogDescription>
                  </DialogHeader>
                  <FormProductsUpdateFromExcel setOpenModalForm={setOpenModalUpdateExcel} session={session} />
                </DialogContent>
              </Dialog>
              <Button onClick={() => exportProductsToExcel()} className="gap-x-2">
                <FileOutput />
                Exportar a Excel
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
