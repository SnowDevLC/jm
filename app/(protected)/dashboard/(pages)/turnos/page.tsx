import { auth } from "@/lib/auth";
import HeaderTurns from "./components/HeaderTurns";
import { getTruns } from "./lib/dataTurns";
import { CalendarTurns } from "./components/CalendarTurns";

export default async function TurnsPage() {
  const session = await  auth();

  if (!session) {
    return;
  }

  const turns = await getTruns();

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <HeaderTurns />
      <CalendarTurns turns={turns} />
    </div>
  );
}
