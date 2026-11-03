import { Prisma } from "@prisma/client";

export default async function getNextNumber(tx: Prisma.TransactionClient, type: string): Promise<number> {
  const counter = await tx.counter.upsert({
    where: { type },
    update: { next: { increment: 1 } },
    create: { type, next: 2 },
  });
  return counter.next - 1;
}

