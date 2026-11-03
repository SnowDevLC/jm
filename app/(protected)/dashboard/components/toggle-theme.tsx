"use client";

import { Computer, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ToggleTheme() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="flex items-center justify-between w-full p-1.5">
      <span className="text-sm">Tema</span>

      <div className="flex rounded-full ring-1 ring-inset ring-border gap-1">

        <button
          onClick={() => setTheme("system")}
          className={`
            p-1.5 rounded-full transition
            ${theme === "system" ? "shadow-sm border" : "opacity-50 hover:opacity-100"}
          `}
        >
          <Computer size={16} />
        </button>
        
        <button
          onClick={() => setTheme("light")}
          className={`
            p-1.5 rounded-full transition
            ${theme === "light" ? "shadow-sm border" : "opacity-50 hover:opacity-100"}
          `}
        >
          <Sun size={16} />
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`
            p-1.5 rounded-full transition
            ${theme === "dark" ? "shadow-sm border" : "rotate-90 opacity-50 hover:opacity-100"}
          `}
        >
          <Moon size={16} />
        </button>

      </div>
    </div>
  );
}
