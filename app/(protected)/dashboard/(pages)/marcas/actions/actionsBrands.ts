"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { brandFormSchema, BrandFormType } from "../lib/zodBrands";


export async function createBrand(values: BrandFormType) {
  const { data, success } = brandFormSchema.safeParse(values);
  if (!success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const nameUpper = data.name.trim().toUpperCase();

    const brandFound = await prisma.brand.findFirst({
      where: {
        name: {
          equals: nameUpper,
          mode: "insensitive",
        },
      },
    });

    if (brandFound) {
      return { success: false, error: `La Categoria con el nombre - ${nameUpper} - ya existe` };
    }

    await prisma.brand.create({ data: { ...data, name: nameUpper } });
    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateBrand(values: BrandFormType, brandId: string) {
  const { data, success } = brandFormSchema.safeParse(values);
  if (!success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const nameUpper = data.name.trim().toUpperCase();

    await prisma.brand.update({
      where: { id: brandId },
      data: { ...data, name: nameUpper },
    });
    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteBrand(brandId: string) {
  try {
    await prisma.brand.delete({
      where: { id: brandId },
    });

    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
