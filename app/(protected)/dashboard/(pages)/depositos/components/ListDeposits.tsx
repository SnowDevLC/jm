import { DataTable } from "@/components/ui/data-table";
import { DepositType } from "../lib/zodDeposits";
import { columns } from "./columns";

export async function ListDeposits({deposits}:{deposits: DepositType[]}) {

  return (
    <div className="p-2">
      <DataTable data={deposits} columns={columns} searchName />
    </div>
  );
}
