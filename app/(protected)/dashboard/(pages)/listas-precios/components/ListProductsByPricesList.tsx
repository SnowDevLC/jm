"use client";

import { DataTable } from "@/components/ui/data-table";
import { ListProductsByPricesListProps } from "../lib/zodPricesLists";
import { createColumns } from "./columnsProducts";

export default function ListProductsByPricesList(props: ListProductsByPricesListProps) {
  const { products, priceLists } = props;

  const columns = createColumns(priceLists);

  return (
    <div className="rounded-lg bg-background shadow-md hover:shadow-lg p-2 h-mi">
      <DataTable data={products} columns={columns} searchName searchSKU />
    </div>
  );
}
 