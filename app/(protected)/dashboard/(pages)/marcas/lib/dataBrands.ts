import prisma from "@/lib/prisma";
import { BrandType } from "./zodBrands";


export async function getBrands(): Promise<BrandType[]> {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      }
    });

    return JSON.parse(JSON.stringify(brands)) as BrandType[];
  } catch (error) {
    return [];
  }
}

