"use client";

import { DataTable } from "@/components/ui/data-table";
import { ListPricesListProps } from "../lib/zodPricesLists";
import { columns } from "./columns";

export default function ListPricesList(props: ListPricesListProps) {
  const { pricesList } = props;

  return (
    <div className="p-2">
      <DataTable data={pricesList} columns={columns} searchName pagination={false} toolbar={false} />
    </div>
  );
}
