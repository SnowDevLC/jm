"use client";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu, X } from "lucide-react";

export default function MobileSidebarHandle() {
  const { openMobile, setOpenMobile, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60]">
      
        <Button
          variant={"outline"}
          onClick={() => setOpenMobile(!openMobile)}
          className="flex size-12 items-center justify-center rounded-lg dark:bg-card"
          aria-label="Alternar menú"
        >
          {openMobile ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      
    </div>
  );
}