import prisma from "@/lib/prisma";
import { ClientType } from "./zodClients";

export async function getClients(): Promise<ClientType[]> {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        name: "asc",
      },
      include: {
        priceList: true,
      }
    });

    return JSON.parse(JSON.stringify(clients)) as ClientType[];
  } catch (error) {
    return [];
  }
}

export async function getClient(clientId: string, from?: Date, to?: Date): Promise<ClientType | null> {
  try {
    const whereClause =
      from && to
        ? {
            date: {
              gte: from,
              lte: to,
            },
          }
        : {};

    const client = await prisma.client.findUnique({
      where: {
        id: clientId,
      },
      include: {
        invoices: {
          where: whereClause,
          orderBy: {
            date: "desc",
          },
          select: {
            id: true,
            number: true,
            date: true,
            total: true,
            status: true,
            car: {
              select: {
                licensePlate: true,
              },
            },
          },
        },
        payments: {
          where: whereClause,
          orderBy: {
            date: "desc",
          },
          select: {
            id: true,
            number: true,
            date: true,
            total: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return JSON.parse(JSON.stringify(client)) as ClientType;
  } catch (error) {
    return null;
  }
}
