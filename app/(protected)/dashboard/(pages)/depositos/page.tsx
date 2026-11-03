
import HeaderDeposits from "./components/HeaderDeposits";
import { ListDeposits } from "./components/ListDeposits";
import { getDeposits } from "./lib/dataDeposits";

export default async function DepositsPage() {
  const deposits = await getDeposits();

  return (
    <div className="flex flex-col">
      <HeaderDeposits />
      <ListDeposits deposits={deposits} />
    </div>
  );
}
