import prisma from "@/lib/prisma";
import { privateRoute } from "@/lib/privateRoute";
import { NextResponse } from "next/server";

export const GET = privateRoute(async (req: Request) => {
   try {
    const suppliers = await prisma.partner.findMany({
      where: {
        type: {
          in: ["PROVEEDOR", "AMBOS"]
        }
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      }
    });

    if (suppliers.length === 0) {
      return NextResponse.json({ message: "Suppliers not found" }, { status: 404 });
    }

    return NextResponse.json(suppliers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error retrieving suppliers" }, { status: 500 });
  }
});
