import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { ClientType } from "../lib/zodClients";

export async function ListClients({clients}:{clients: ClientType[]}) {

  return (
    <div className="p-4">
      <DataTable data={clients} columns={columns} searchName />
    </div>
  );
}
