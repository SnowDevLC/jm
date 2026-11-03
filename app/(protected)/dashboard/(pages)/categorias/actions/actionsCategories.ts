"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { categoryFormSchema, CategoryFormType } from "../lib/zodCategories";


export async function createCategory(values: CategoryFormType) {
  const { data, success } = categoryFormSchema.safeParse(values);
  if (!success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const nameUpper = data.name.trim().toUpperCase();

    const categoryFound = await prisma.category.findFirst({
      where: {
        name: {
          equals: nameUpper,
          mode: "insensitive",
        },
      },
    });

    if (categoryFound) {
      return { success: false, error: `La Categoria con el nombre - ${nameUpper} - ya existe` };
    }

    await prisma.category.create({ data: { ...data, name: nameUpper, parentId: data.parentId || null } });
    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateCategory(values: CategoryFormType, categoryId: string) {
  const { data, success } = categoryFormSchema.safeParse(values);
  if (!success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    const nameUpper = data.name.trim().toUpperCase();

    await prisma.category.update({
      where: { id: categoryId },
      data: { ...data, name: nameUpper },
    });
    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
