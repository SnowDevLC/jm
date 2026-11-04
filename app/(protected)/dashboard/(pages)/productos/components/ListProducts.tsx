import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { columnsForUsers } from "./columnsForUsers";
import { ListProductsProps } from "../lib/zodProducts";
import { SessionProvider } from "next-auth/react";
import { getCategories } from "../../categorias/lib/dataCategories";
import { getBrands } from "../../marcas/lib/dataBrands";

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function ListProducts(props: ListProductsProps) {
  const { products, session } = props;
  await sleep(2000);

  const brands = await getBrands();
  const brandsNames = Array.from(new Set(brands.map((brand: any) => brand.name)));
  const categories = await getCategories();

  const categoryCount = new Map<string, number>();

  products.forEach((product) => {
    product.categories.forEach((category) => {
      categoryCount.set(category.name, (categoryCount.get(category.name) ?? 0) + 1);
    });
  });

  const categoriesOptions = categories.map((category) => ({
    label: category.name,
    value: category.name,
    count: categoryCount.get(category.name) ?? 0,
  }));

  return (
    <SessionProvider>
      <div className="p-2">
        {session?.user.role === "ADMIN" || session?.user.role === "SUPERADMIN" ? (
          <DataTable
            data={products}
            columns={columns}
            searchName
            searchSKU
            searchBarcode
            filterBrands
            filterCategories
            options={brandsNames}
            options2={categoriesOptions}
          />
        ) : (
          <DataTable
            data={products}
            columns={columnsForUsers}
            searchName
            searchSKU
            searchBarcode
            filterBrands
            options={brandsNames}
          />
        )}
      </div>
    </SessionProvider>
  );
}
