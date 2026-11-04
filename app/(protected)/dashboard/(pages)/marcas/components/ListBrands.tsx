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
    <div className="p-2">
      <DataTable data={brands} columns={columns} searchName pagination={false} toolbar={false} />
    </div>
  );
}
