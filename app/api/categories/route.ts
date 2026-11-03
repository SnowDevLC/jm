import prisma from "@/lib/prisma";
import { privateRoute } from "@/lib/privateRoute";
import { NextResponse } from "next/server";

export const GET = privateRoute(async (req: Request) => {
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

    if (categories.length === 0) {
      return NextResponse.json({ message: "Categories not found" }, { status: 404 });
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error retrieving categories" }, { status: 500 });
  }
});
