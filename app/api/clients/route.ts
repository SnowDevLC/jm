import prisma from "@/lib/prisma";
import { privateRoute } from "@/lib/privateRoute";
import { NextResponse } from "next/server";

export const GET = privateRoute(async (req: Request) => {
   try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        phone: true,
      }
    });

    if (clients.length === 0) {
      return NextResponse.json({ message: "Clients not found" }, { status: 404 });
    }

    return NextResponse.json(clients, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error retrieving clients" }, { status: 500 });
  }
});
