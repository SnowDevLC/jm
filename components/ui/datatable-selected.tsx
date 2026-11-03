import { Table } from "@tanstack/react-table";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTableSelected<TData>({ table }: DataTablePaginationProps<TData>) {
  return (
    <div className="flex-1 text-sm text-muted-foreground">
      {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} fila(s)
      seleccionada.
    </div>
  );
}