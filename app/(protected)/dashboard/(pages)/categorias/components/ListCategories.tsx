"use client";

import { DataTable } from "@/components/ui/data-table";
import { CategoryType } from "../lib/zodCategories";
import { columns } from "./columns";

type ListCategoriesProps = {
  categories: CategoryType[];
}

export default function ListCategories(props: ListCategoriesProps) {
  const { categories } = props;

  return (
    <div className="rounded-lg bg-background shadow-md hover:shadow-lg p-2 h-min w-full md:w-1/3">
      <DataTable data={categories} columns={columns} searchName pagination={false} toolbar={false} />
    </div>
  );
}
