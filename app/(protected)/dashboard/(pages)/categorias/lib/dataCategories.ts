import prisma from "@/lib/prisma";
import { CategoryType } from "./zodCategories";


export async function getCategories(): Promise<CategoryType[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      }
    });

    return JSON.parse(JSON.stringify(categories)) as CategoryType[];
  } catch (error) {
    return [];
  }
}

