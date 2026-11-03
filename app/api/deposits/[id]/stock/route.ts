import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const deposit = await prisma.deposit.findUnique({
      where: { id },
      include: {
        stock: {
          select: {
            productId: true,
            quantity: true,
            product: {
              select: {
                name: true,
                brand: true,
                cost: true,
                price: true,
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
      },
    });

    if (!deposit) {
      return NextResponse.json({ message: "Deposit not found" }, { status: 404 });
    }

    return NextResponse.json(deposit, { status: 200 });
  } catch (error) {
    console.error("Error getting deposit:", error);
    return NextResponse.json({ message: "Errorgetting deposit" }, { status: 500 });
  }
}