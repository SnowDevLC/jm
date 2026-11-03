import prisma from "@/lib/prisma";
import { privateRoute } from "@/lib/privateRoute";
import { NextResponse } from "next/server";

export const GET = privateRoute(async (req: Request) => {
  try {
    const priceLists = await prisma.priceList.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        isDefault: true,
      }
    });

    if (priceLists.length === 0) {
      return NextResponse.json({ error: "No se encontró ninguna lista de precios" }, { status: 404 });
    }

    return NextResponse.json(priceLists);
  } catch (error) {
    console.error("Error obteniendo listas de precios:", error);

    return NextResponse.json({ error: "Error al obtener listas de precios" }, { status: 500 });
  }
});
