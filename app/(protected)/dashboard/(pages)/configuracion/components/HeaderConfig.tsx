"use client";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export default function HeaderConfig() {
  const { isMobile } = useSidebar();

  return (
    <div className="sticky top-0 z-10 flex justify-end items-center bg-sidebar h-14 px-2 border-sidebar-border border-b">
      {isMobile && <SidebarTrigger className="absolute left-4" />}
      <h2 className="text-xl absolute left-1/2 -translate-x-1/2 flex items-center justify-center max-w-[50%]">
        Configuración
      </h2>
    </div>
  );
}
