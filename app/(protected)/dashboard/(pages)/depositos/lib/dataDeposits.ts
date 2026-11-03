import prisma from "@/lib/prisma";
import { DepositType } from "./zodDeposits";

export async function getDeposits(): Promise<DepositType[]> {
  try {
    const deposits = await prisma.deposit.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      }
    });

    return JSON.parse(JSON.stringify(deposits)) as DepositType[];
  } catch (error) {
    console.error("error al obtener los datos", error);
    return [];
  }
}

export async function getDeposit(depositId: string, from?: Date, to?: Date): Promise<DepositType | null> {
  try {
    const whereClause = from && to ? {
      date: {
        gte: from,
        lte: to,
      },
    } : undefined;

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: {
        stock: {
          select: {
            productId: true,
            quantity: true,
            product: {
              select: {
                name: true,
                category: true,
                cost: true,
                price: true,
                priceWholesaler: true,
                SKU: true,
                barcode: true,
                discount: true,
                isActiveShop: true,
              },
            },
          },
          orderBy: {
            product: {
              name: "asc",
            },
          },
        },
        stockMovements: {
          where: whereClause,
          orderBy: {
            date: "desc",
          },
          select: {
            date: true,
            type: true,
            relatedDeposit: true,
            products: {
              select: {
                quantity: true,
                product: {
                  select: {
                    name: true,
                    SKU: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!deposit) {
      return null;
    }

    return JSON.parse(JSON.stringify(deposit)) as DepositType;
  } catch (error) {
    console.log(error)
    return null;
  }
}


export const movements = [
  {
    value: "ENTRADA",
    label: "ENTRADA",
  },
  {
    value: "SALIDA",
    label: "SALIDA",
  },
];
