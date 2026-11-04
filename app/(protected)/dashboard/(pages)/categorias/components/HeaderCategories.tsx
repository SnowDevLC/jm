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
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import FormCategory from "./FormCategory";

export default function HeaderCategories() {
  const [openModalCreate, setOpenModalCreate] = useState(false);

  return (
    <div className="sticky top-0 z-10 flex justify-end items-center bg-sidebar h-14 px-2 border-sidebar-border border-b">
      <h2 className="text-xl absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[50%]">
        Categorias
      </h2>
      <div className="flex gap-2 mr-2 md:mr-0">
        <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
          <DialogTrigger
            render={
              <Button className="gap-x-2">
                <CirclePlus />
                Crear Categoria
              </Button>
            }
          />
          <DialogContent className="sm:max-w-156">
            <DialogHeader>
              <DialogTitle>Crear Categoria</DialogTitle>
              <DialogDescription>Crear y Editar Categoria</DialogDescription>
            </DialogHeader>
            <FormCategory setOpenModalForm={setOpenModalCreate} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
