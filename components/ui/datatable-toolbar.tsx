"use client";

import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/datatable-viewoptions";
import { DataTableFacetedFilter } from "@/components/ui/datatable-facetedfilter";

// import { roles } from "@/app/(protected)/dashboard/(pages)/usuarios/lib/zodUsers";
// import { statuses } from "@/app/(protected)/dashboard/(pages)/trabajos/lib/zodInvoices";
import { X } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters: {
    options: string[];
    options2: any[];
    searchName: boolean;
    searchSKU: boolean;
    searchBarcode: boolean;
    searchClient: boolean;
    searchClientName: boolean;
    searchPhone: boolean;
    filterBrands: boolean;
    filterCategories: boolean;
    filterStatus: boolean;
    filterRole: boolean;
    filterInvoice: boolean;
  };
}

export function DataTableToolbar<TData>({ table, filters }: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const invoiceStatus = [
    {
      value: "SI",
      label: "Facturado",
    },
    {
      value: "NO",
      label: "Sin Facturar",
    },
  ];

  return (
    <div className="flex flex-col gap-2 md:flex-row">
      {filters.searchClient && (
        <Input
          placeholder="Filtrar por Cliente..."
          value={(table.getColumn("client")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("client")?.setFilterValue(event.target.value)}
          className="h-8 md:w-62"
        />
      )}
      {filters.searchClientName && (
        <Input
          placeholder="Filtrar por Cliente..."
          value={(table.getColumn("clientName")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("clientName")?.setFilterValue(event.target.value)}
          className="h-8 md:w-62"
        />
      )}
      {filters.searchName && (
        <Input
          placeholder="Filtrar por Nombre..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
          className="h-8 md:w-62"
        />
      )}
      {filters.searchPhone && (
        <Input
          placeholder="Filtrar por Teléfono..."
          value={(table.getColumn("phone")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("phone")?.setFilterValue(event.target.value)}
          className="h-8 md:w-62"
        />
      )}
      {filters.searchSKU && (
        <Input
          placeholder="Filtrar por SKU..."
          value={(table.getColumn("SKU")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("SKU")?.setFilterValue(event.target.value)}
          className="h-8 md:w-62.5"
        />
      )}
      {filters.searchBarcode && (
        <Input
          placeholder="Filtrar por Cod Barra..."
          value={(table.getColumn("barcode")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("barcode")?.setFilterValue(event.target.value)}
          className="h-8 md:w-62.5"
        />
      )}

      <div className="flex w-full flex-wrap items-center justify-between gap-y-2">
        <div className="flex flex-wrap items-center gap-1">
          {filters.filterBrands && table.getColumn("brand") !== undefined && (
            <DataTableFacetedFilter
              column={table.getColumn("brand")}
              title="Marca"
              options={filters.options.map((item) => ({ label: item, value: item }))}
            />
          )}
          {filters.filterCategories && table.getColumn("categories") !== undefined && (
            <DataTableFacetedFilter
              column={table.getColumn("categories")}
              title="Categorias"
              options={filters.options2}
            />
          )}
          {/* {filters.filterStatus && table.getColumn("status") !== undefined && (
            <DataTableFacetedFilter column={table.getColumn("status")} title="Estado" options={statuses} />
          )}
          {filters.filterRole && table.getColumn("role") !== undefined && (
            <DataTableFacetedFilter column={table.getColumn("role")} title="Rol" options={roles} />
          )} */}
          {filters.filterInvoice && table.getColumn("invoice") !== undefined && (
            <DataTableFacetedFilter column={table.getColumn("invoice")} title="Facturación" options={invoiceStatus} />
          )}
          {isFiltered && (
            <Button variant="outline" onClick={() => table.resetColumnFilters()} className="h-8 px-2 lg:px-3">
              Reset
              <X />
            </Button>
          )}
        </div>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
