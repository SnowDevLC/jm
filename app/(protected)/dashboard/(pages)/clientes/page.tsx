import HeaderClients from "./components/HeaderClients";
import { ListClients } from "./components/ListClients";
import { getClients } from "./lib/dataClients";


export default async function ClientsPage() {

const clients = await getClients();
  return (
    <div className="flex flex-col">
      <HeaderClients />
      <ListClients clients={clients} />
    </div>
  );
}