"use client";

import { DataTable } from "@/components/ui/data-table";
import { BrandType } from "../lib/zodBrands";
import { columns } from "./columns";

type ListBrandsProps = {
  brands: BrandType[];
}

export default function ListBrands(props: ListBrandsProps) {
  const { brands } = props;

  return (
    <div className="rounded-lg bg-background shadow-md hover:shadow-lg p-2 h-min w-full md:w-1/3">
      <DataTable data={brands} columns={columns} searchName pagination={false} toolbar={false} />
    </div>
  );
}
