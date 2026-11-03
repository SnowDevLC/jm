import { getListsPrices, getProductsByPricesLists } from "./lib/dataPricesLists";
import HeaderPricesList from "./components/HeaderPricesLists";
import ListPricesList from "./components/ListPricesLists";
import ListProductsByPricesList from "./components/ListProductsByPricesList";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const pricesList = await getListsPrices();
  const products = await getProductsByPricesLists();

  const priceListsMap = new Map<string, string>();

  for (const product of products) {
    for (const item of product.priceLists) {
      priceListsMap.set(item.priceList.id, item.priceList.name);
    }
  }

  const priceLists = Array.from(priceListsMap, ([id, name]) => ({ id, name }));

  return (
    <div className="flex flex-col">
      <HeaderPricesList />
      <ListPricesList pricesList={pricesList} />
      <Separator />
      <ListProductsByPricesList products={products} priceLists={priceLists}/>
    </div>
  );
}
