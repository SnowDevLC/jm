"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart,
  BookUser,
  ClipboardList,
  DollarSign,
  File,
  LayoutDashboard,
  PackageSearch,
  Receipt,
  Search,
  Settings,
  ShieldUser,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
  Warehouse,
  Tags,
  Shapes,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import SidebarHandle from "./sidebar-handle";
import { NavUser } from "./nav-user";
import { Session } from "next-auth";
import { useTheme } from "next-themes";
import MobileSidebarHandle from "./mobile-sidebar-handle";

type Role = "ADMIN" | "SUPERADMIN" | "USER";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menu: MenuSection[] = [
  {
    title: "General",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SUPERADMIN", "USER"] },
      // { name: "Facturación", href: "/dashboard/vender", icon: ShoppingCart, roles: ["ADMIN", "SUPERADMIN", "USER"] },
      // { name: "Gastos", href: "/dashboard/gastos", icon: Banknote, roles: ["ADMIN", "SUPERADMIN", "USER"] },
      { name: "Clientes", href: "/dashboard/clientes", icon: BookUser, roles: ["ADMIN", "SUPERADMIN", "USER"] },
    ],
  },
  {
    title: "Inventario",
    items: [
      { name: "Productos", href: "/dashboard/productos", icon: PackageSearch, roles: ["ADMIN", "SUPERADMIN", "USER"] },
      { name: "Marcas", href: "/dashboard/marcas", icon: Tags, roles: ["ADMIN", "SUPERADMIN", "USER"] },
      {
        name: "Categorias",
        href: "/dashboard/categorias",
        icon: Shapes,
        roles: ["ADMIN", "SUPERADMIN", "USER"],
      },
      {
        name: "Listas de Precios",
        href: "/dashboard/listas-precios",
        icon: ClipboardList,
        roles: ["ADMIN", "SUPERADMIN", "USER"],
      },
      { name: "Depósitos", href: "/dashboard/depositos", icon: Warehouse, roles: ["ADMIN", "SUPERADMIN"] },
    ],
  },
  // {
  //   title: "Compras",
  //   items: [
  //     { name: "Proveedores", href: "/dashboard/proveedores", icon: Truck, roles: ["ADMIN", "SUPERADMIN", "USER"] },
  //     { name: "Compras", href: "/dashboard/compras", icon: ShoppingBag, roles: ["ADMIN", "SUPERADMIN", "USER"] },
  //   ],
  // },
  // {
  //   title: "Finanzas",
  //   items: [{ name: "Caja", href: "/dashboard/cajas", icon: DollarSign, roles: ["ADMIN", "SUPERADMIN"] }],
  // },
  // {
  //   title: "Reportes",
  //   items: [
  //     { name: "Ventas", href: "/dashboard/ventas", icon: Receipt, roles: ["ADMIN", "SUPERADMIN"] },
  //     { name: "Estadísticas", href: "/dashboard/estadisticas", icon: BarChart, roles: ["ADMIN", "SUPERADMIN"] },
  //     { name: "Comprobantes", href: "/dashboard/comprobantes", icon: File, roles: ["ADMIN", "SUPERADMIN"] },
  //   ],
  // },
  {
    title: "Administración",
    items: [
      { name: "Usuarios", href: "/dashboard/usuarios", icon: ShieldUser, roles: ["ADMIN", "SUPERADMIN"] },
      { name: "Sucursales", href: "/dashboard/sucursales", icon: Store, roles: ["ADMIN", "SUPERADMIN"] },
      { name: "Configuración", href: "/dashboard/configuracion", icon: Settings, roles: ["ADMIN", "SUPERADMIN"] },
    ],
  },
];

function filterMenu(menu: MenuSection[], role: Role): MenuSection[] {
  return menu
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((section) => section.items.length > 0);
}

export function AppSidebar({ session }: { session: Session }) {
  const pathname = usePathname();
  const [inputNumber, setInputNumber] = useState("");

  const role = session.user.role as Role;
  const filteredMenu = filterMenu(menu, role);

  return (
    <>
      <Sidebar collapsible="icon" className="group/sidebar transition-all duration-300 border-sidebar-border">
        <SidebarHandle />
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-20 group-data-[collapsible=icon]:p-0!"
                render={<Link href="/dashboard" />}
              >
                <img src="/JM-logo.png" className="h-14 group-data-[collapsible=icon]:h-8" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold">JM</span>
                  <span className="truncate text-xs text-muted-foreground">Sistema de gestión</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup className="py-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center">
          <div className="flex items-center border rounded-lg bg-card p-1 group-data-[collapsible=icon]:hidden">
            <Search strokeWidth={1} />
            <input
              placeholder="Buscar ..."
              value={inputNumber}
              onChange={(e) => setInputNumber(e.target.value)}
              className="bg-transparent w-full outline-none pl-2 text-sm"
            />
            <div className="h-5 w-5 flex items-center justify-center border p-3 rounded-sm">
              <span className="text-xs pointer-events-none">F</span>
            </div>
          </div>
          <div className="h-5 w-5 items-center justify-center border p-3 rounded-sm mb-2 hidden group-data-[collapsible=icon]:flex">
            <span className="text-xs pointer-events-none">F</span>
          </div>
        </SidebarGroup>
        <SidebarContent className="mt-2">
          {filteredMenu.map((menu, index) => {
            return (
              <SidebarGroup className="py-0 group-data-[collapsible=icon]:items-center" key={index}>
                <SidebarGroupLabel className="uppercase">{menu.title}</SidebarGroupLabel>

                <div className="ml-2 pl-3 border-l border-sidebar-border group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:pl-0">
                  <SidebarMenu>
                    {menu.items.map((submenu) => {
                      const Icon = submenu.icon;
                      const active =
                        submenu.href === "/dashboard" ? pathname === submenu.href : pathname.startsWith(submenu.href);

                      return (
                        <SidebarMenuItem key={submenu.name}>
                          <SidebarMenuButton
                            isActive={active}
                            render={<Link href={submenu.href} className="relative" />}
                          >
                            {active && <span className="absolute left-0 top-0 h-full w-1 bg-primary" />}
                            <Icon />
                            <span>{submenu.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </div>
              </SidebarGroup>
            );
          })}
        </SidebarContent>

        <SidebarFooter>
          <NavUser session={session} />
        </SidebarFooter>
      </Sidebar>
      <MobileSidebarHandle />
    </>
  );
}
