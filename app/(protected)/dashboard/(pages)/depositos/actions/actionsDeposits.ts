"use server";

import { revalidatePath } from "next/cache";
import { depositFormSchema, DepositFormType } from "../lib/zodDeposits";
import prisma from "@/lib/prisma";

export async function createDeposit(values: DepositFormType) {
  const { data, success } = depositFormSchema.safeParse(values);
  if (!success) {
    return { error: "Invalid data" };
  }
  if (data.address === "") {
    delete data.address;
  }

  try {
    const { name, address } = data;

    const depositFound = await prisma.deposit.findFirst({
      where: {
        name: {
          equals: name.toUpperCase(),
          mode: "insensitive",
        },
      },
    });

    if (depositFound) return { error: "Deposit already exists" };

    const newDeposit = await prisma.deposit.create({
      data: {
        name: name.toUpperCase(),
        address,
      },
    });

    const products = await prisma.product.findMany({
      select: {
        id: true,
      },
    });

    const productStocks = products.map((product) => ({
      productId: product.id,
      depositId: newDeposit.id,
      quantity: 0,
    }));

    await prisma.productStock.createMany({
      data: productStocks,
    });

    revalidatePath("/dashboard/deposits");
    return { success: true };
  } catch (error) {
    return { error: "An unexpected error occurred" };
  }
}

export async function updateDeposit(values: DepositFormType, depositId: string) {
  const { data, success } = depositFormSchema.safeParse(values);
  if (!success) {
    return { error: "Invalid data" };
  }

  try {
    await prisma.deposit.update({
      where: { id: depositId },
      data,
    });
    revalidatePath("/dashboard/deposits");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteDeposit(depositId: string) {
  try {
    await prisma.deposit.delete({
      where: { id: depositId },
    });
    revalidatePath("/dashboard/deposits");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
