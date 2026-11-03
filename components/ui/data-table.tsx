"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTablePagination } from "./datatable-pagination";
import { DataTableToolbar } from "./datatable-toolbar";
import { Button } from "./button";
import { usePathname } from "next/navigation";
import { DataTableSelected } from "./datatable-selected";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onItemsSelected?: (items: TData[]) => void;
  pagination?: boolean;
  toolbar?: boolean;
  selected?: boolean;
  options?: string[];
  options2?: any[];
  searchName?: boolean;
  searchSKU?: boolean;
  searchBarcode?: boolean;
  searchClient?: boolean;
  searchClientName?: boolean;
  searchPhone?: boolean;
  filterBrands?: boolean;
  filterCategories?: boolean;
  filterStatus?: boolean;
  filterRole?: boolean;
  filterInvoice?: boolean;
  pageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onItemsSelected,
  pagination = true,
  toolbar = true,
  selected = false,
  options = [],
  options2 = [],
  searchName = false,
  searchSKU = false,
  searchBarcode = false,
  searchClient = false,
  searchClientName = false,
  searchPhone = false,
  filterBrands = false,
  filterCategories = false,
  filterStatus = false,
  filterRole = false,
  filterInvoice = false,
  pageSize = 20,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [isMounted, setIsMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  if (!isMounted) {
    return null;
  }

  const toolbarFilters = {
    options,
    options2,
    searchName,
    searchSKU,
    searchBarcode,
    searchClient,
    searchClientName,
    searchPhone,
    filterBrands,
    filterCategories,
    filterStatus,
    filterRole,
    filterInvoice,
  };

  return (
    <div className="flex flex-col gap-y-4">
      {onItemsSelected && (
        <Button
          onClick={() => {
            const selectedItems = table.getSelectedRowModel().rows.map((row) => row.original);
            if (onItemsSelected) {
              onItemsSelected(selectedItems);
            }
          }}
        >
          Agregar Items Seleccionados
        </Button>
      )}
      {selected && (
        <div className="flex flex-col items-center justify-between space-y-2 md:flex-row-reverse md:space-y-0">
          <DataTableSelected table={table} />
        </div>
      )}
      {toolbar && <DataTableToolbar table={table} filters={toolbarFilters} />}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && <DataTablePagination table={table} />}
    </div>
  );
}