
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    

    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const whereClause = fromDate && toDate
      ? {
          date: {
            gte: fromDate,
            lte: toDate,
          },
        }
      : undefined;

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
                categories: true,
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
      return NextResponse.json({ message: "Deposit not found" }, { status: 404 });
    }

    return NextResponse.json(deposit, { status: 200 });
  } catch (error) {
    console.error("Error getting deposit:", error);
    return NextResponse.json({ message: "Errorgetting deposit" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ message: "Deposit ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();

    const updatedDeposit = await prisma.deposit.update({
      where: { id },
      data: body,
    });

    if (!updatedDeposit) {
      return NextResponse.json({ message: "Deposit not update" }, { status: 404 });
    }

    return NextResponse.json(updatedDeposit, { status: 202 });
  } catch (error) {
    console.error("Error updating deposit:", error);
    return NextResponse.json({ message: "Error updating deposit", error }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.productStock.deleteMany({
      where: {
        depositId: id,
      },
    });

    const deposit = await prisma.deposit.delete({
      where: { id },
    });
    if (!deposit) {
      return NextResponse.json({ message: "Deposit not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Deleted deposit" }, { status: 202 });
  } catch (error) {
    console.error("Error deleting deposit:", error);
    return NextResponse.json({ message: "Error deleting deposit" }, { status: 500 });
  }
}
