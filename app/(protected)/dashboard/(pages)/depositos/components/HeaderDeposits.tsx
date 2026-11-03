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
import { ArrowRightCircle, CirclePlus } from "lucide-react";
import { useState } from "react";
import FormDeposit from "./FormDeposit";
import Link from "next/link";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export default function HeaderDeposits() {
  const [openModalCreate, setOpenModalCreate] = useState(false);

  const { isMobile } = useSidebar();

  return (
    <div className="sticky top-0 z-10 flex justify-end items-center bg-sidebar h-14 px-2 border-sidebar-border border-b">
      {isMobile && <SidebarTrigger className="absolute left-4" />}
      <h2 className="text-xl absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[50%]">
        Depósitos
      </h2>
      <div className="flex flex-col items-end gap-2 md:flex-row">
        <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
          <DialogTrigger
            render={
              <Button className="gap-x-2">
                <CirclePlus />
                Crear Depósito
              </Button>
            }
          />
          <DialogContent className="sm:max-w-156">
            <DialogHeader>
              <DialogTitle>Crear Depósito</DialogTitle>
              <DialogDescription>Complete con los datos para crear un nuevo depósito.</DialogDescription>
            </DialogHeader>
            <FormDeposit setOpenModalForm={setOpenModalCreate} />
          </DialogContent>
        </Dialog>
        <Link href={"/dashboard/deposits/move-stock"}>
          <Button className="gap-x-2">
            <ArrowRightCircle />
            Mover Stock
          </Button>
        </Link>
      </div>
    </div>
  );
}
