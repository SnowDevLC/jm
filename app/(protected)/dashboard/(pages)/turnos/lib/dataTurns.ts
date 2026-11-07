import prisma from "@/lib/prisma";
import { TurnType } from "./zodTurns";

export async function getTruns(): Promise<TurnType[]> {
  try {
    const turns = await prisma.turn.findMany({
      include: {
        client: true,
      }
    });

    return JSON.parse(JSON.stringify(turns)) as TurnType[];
  } catch (error) {
    return [];
  }
}