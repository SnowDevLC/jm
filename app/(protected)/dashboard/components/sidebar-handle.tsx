"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SidebarHandle() {
  const { open, setOpen } = useSidebar();

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 group z-50">
      <button
        onClick={() => setOpen(!open)}
        className="
        opacity-0 group-hover:opacity-100
        transition
        flex items-center justify-center
        rounded-full
        p-2
        border
        bg-background
        shadow-sm
        hover:bg-accent
      "
      >
        {open ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
