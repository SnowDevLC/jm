import prisma from "@/lib/prisma";
import { ProductType } from "./zodProducts";

export async function getProducts(): Promise<ProductType[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        SKU: "asc",
      },
      select: {
        id: true,
        SKU: true,
        name: true,
        barcode: true,
        cost: true,
        totalStock: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
        priceLists: {
          where: {
            priceList: {
              isDefault: true,
            },
          },
          select: {
            price: true,
          },
        },
      },
    });

    return JSON.parse(JSON.stringify(products)) as ProductType[];
  } catch (error) {
    return [];
  }
}

export async function getProduct(productId: string, from?: Date, to?: Date): Promise<ProductType | null> {
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

    const stockMovementWhereClause = {
      ...whereClause,
      type: "SALIDA",
    };

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        SKU: true,
        name: true,
        barcode: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        price: true,
        cost: true,
        discount: true,
        isActiveShop: true,
        totalStock: true,
        stock: {
          select: {
            deposit: {
              select: {
                id: true,
                name: true,
              },
            },
            quantity: true,
          },
        },
        invoices: {
          where: {
            invoice: whereClause,
          },
          orderBy: {
            invoice: {
              date: "desc",
            },
          },
          select: {
            invoiceId: true,
            quantity: true,
            invoice: {
              select: {
                number: true,
                date: true,
                status: true,
                client: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        stockMovements: {
          where: {
            stockMovement: stockMovementWhereClause,
          },
          orderBy: {
            stockMovement: {
              date: "desc",
            },
          },
          select: {
            quantity: true,
            stockMovement: {
              select: {
                date: true,
                relatedDeposit: true,
                deposit: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        productsModifications: {
          where: {
            date: whereClause.date,
          },
        },
      },
    });

    if (!product) {
      return null;
    }

    return JSON.parse(JSON.stringify(product)) as ProductType;
  } catch (error) {
    return null;
  }
}
