import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getExchangeRateTypes, getSystemSettings } from "./lib/dataConfig";
import HeaderConfig from "./components/HeaderConfig";
import FormSystemSettings from "./components/FormSystemSettings";
import ListExchangeRatesTypes from "./components/ListExchangeRates";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const session = await auth();
  if (session?.user.role === "USER") {
    redirect("/dashboard");
  }

  const systemSettings = await getSystemSettings();
  const exchangeRateTypes = await getExchangeRateTypes();

  return (
    <div className="flex flex-col">
      <HeaderConfig />
      <div className="flex flex-col p-4 gap-4">
        <ListExchangeRatesTypes exchangeRateTypes={exchangeRateTypes} />
        <Separator />
        <FormSystemSettings systemSettings={systemSettings} exchangeRateType={exchangeRateTypes}/>
      </div>
    </div>
  );
}
