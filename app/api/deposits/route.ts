import prisma from "@/lib/prisma";
import { privateRoute } from "@/lib/privateRoute";
import { NextResponse } from "next/server";

export const GET = privateRoute(async (req: Request) => {
  try {
    const deposits = await prisma.deposit.findMany({
      orderBy: {
        name: "asc",
      },
    });

    if (deposits.length === 0) {
      return NextResponse.json({ message: "Deposits not found" }, { status: 404 });
    }

    return NextResponse.json(deposits, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error retrieving deposit" }, { status: 500 });
  }
});
