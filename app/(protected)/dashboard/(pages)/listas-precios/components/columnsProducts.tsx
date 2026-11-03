"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/ui/datatable-columnheader";
import { formatCurrency } from "@/lib/utils";
import { ProductType } from "../../productos/lib/zodProducts";

//MODIFICACION PARA ACEPTAR OTRO ATRIBUTO, HACIENDO UNA EXTENSION
type CustomColumnDef<T> = ColumnDef<T> & { headerTitle?: string };

type PriceListColumn = {
  id: string;
  name: string;
};

export const createColumns = (priceLists: PriceListColumn[]): CustomColumnDef<ProductType>[] => [
  {
    accessorKey: "SKU",
    headerTitle: "SKU",
    header: ({ column }) => <DataTableColumnHeader column={column} title="SKU" />,
    cell: ({ row }) => <div className="font-medium">{row.original.SKU ?? "-"}</div>,
  },
  {
    accessorKey: "name",
    headerTitle: "Nombre",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div className="font-semibold">{row.original.name}</div>,
  },

  ...priceLists.map(
    (priceList): CustomColumnDef<ProductType> => ({
      id: `priceList-${priceList.id}`,
      headerTitle: priceList.name,
      header: ({ column }) => <DataTableColumnHeader column={column} title={priceList.name} />,
      cell: ({ row }) => {
        const productPriceList = row.original.priceLists.find((item) => item.priceList.id === priceList.id);

        if (!productPriceList) {
          return <div className="font-medium">—</div>;
        }

        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{formatCurrency(Number(productPriceList.price))}</span>

            <span className="text-xs text-muted-foreground">Margen: {Number(productPriceList.marginValue)}%</span>
          </div>
        );
      },
    }),
  ),
];
