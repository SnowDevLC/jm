import prisma from "@/lib/prisma";
import { privateRoute } from "@/lib/privateRoute";
import { NextResponse } from "next/server";

export const GET = privateRoute(async (req: Request) => {
  try {
    const settings = await prisma.systemSettings.findFirst({
      include: {
        exchangeRateType: {
          include: {
            rates: {
              orderBy: {
                date: "desc",
              },
              take: 1,
              select: {
                rate: true,
              },
            },
          },
        },
      },
    });

    if (!settings) {
      return NextResponse.json({ error: "No se encontró la configuración del sistema" }, { status: 404 });
    }

    const currentRate = 0;

    return NextResponse.json({
      priceRounding: Number(settings.priceRounding),
      currentRate: Number(currentRate),
      marginDefault: Number(settings.marginDefault),
    });
  } catch (error) {
    console.error("Error obteniendo la configuración:", error);

    return NextResponse.json({ error: "Error al obtener la configuración del sistema" }, { status: 500 });
  }
});
