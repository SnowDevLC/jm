import prisma from "@/lib/prisma";
import { PricesListType } from "./zodPricesLists";
import { ProductType } from "../../productos/lib/zodProducts";

export async function getListsPrices(): Promise<PricesListType[]> {
  try {
    const listsPrices = await prisma.priceList.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        marginType: true,
        marginValue: true,
        isDefault: true,
        marginRules: {
          select: {
            id: true,
            minBaseMargin: true,
            coefficient: true,
          }
        }
      },
    });

    return JSON.parse(JSON.stringify(listsPrices)) as PricesListType[];
  } catch (error) {
    return [];
  }
}

export async function getProductsByPricesLists(): Promise<ProductType[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        SKU: true,
        name: true,
        priceLists: {
          where: {
            priceList: {
              isActive: true,
            },
          },
          select: {
            price: true,
            marginValue: true,
            mode: true,
            priceList: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return JSON.parse(JSON.stringify(products)) as ProductType[];
  } catch (error) {
    return [];
  }
}
