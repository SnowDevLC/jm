import HeaderBrands from "./components/HeaderBrands";
import ListBrands from "./components/ListBrands";
import { getBrands } from "./lib/dataBrands";

export default async function BrandsPage() {

const brands = await getBrands();
  return (
    <div className="flex flex-col">
      <HeaderBrands />
      <ListBrands brands={brands} />
    </div>
  );
}
