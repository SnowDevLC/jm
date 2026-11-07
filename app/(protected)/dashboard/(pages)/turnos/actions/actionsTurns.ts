"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { turnFormSchema, TurnFormType } from "../lib/zodTurns";

export async function createTurn(values: TurnFormType) {
  const { data, success } = turnFormSchema.safeParse(values);
  if (!success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    await prisma.turn.create({ data: {
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      status: "PENDIENTE",
      car: data.car,
      description: data.description,
      category: data.category,
      clientId: data.clientId,
    } });

    revalidatePath("/dashboard/turnos");
    return { success: true };
  } catch (error) {
    return { success: false, error: "An unexpected error occurred" };
  }
}
