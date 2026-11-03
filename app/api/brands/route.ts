import prisma from "@/lib/prisma";
import { privateRoute } from "@/lib/privateRoute";
import { NextResponse } from "next/server";

export const GET = privateRoute(async (req: Request) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (brands.length === 0) {
      return NextResponse.json({ message: "Brands not found" }, { status: 404 });
    }

    return NextResponse.json(brands, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error retrieving Brands" }, { status: 500 });
  }
});
