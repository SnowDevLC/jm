import { auth } from "@/lib/auth";
import { getDeposits } from "../depositos/lib/dataDeposits";
import HeaderProducts from "./components/HeaderProducts";
import { ListProducts } from "./components/ListProducts";
import { getProducts } from "./lib/dataProducts";

export default async function ProductsPage() {
  const [products, deposits, session] = await Promise.all([getProducts(), getDeposits(), auth()]);

  if (!session) {
    return;
  }

  return (
    <div className="flex flex-col">
      <HeaderProducts deposits={deposits} session={session} />
      <ListProducts products={products} session={session} />
    </div>
  );
}
