"use server";

import { revalidatePath } from "next/cache";
import { clientFormSchema, ClientFormType, ClientType } from "../lib/zodClients";
import prisma from "@/lib/prisma";

export async function createClient(values: ClientFormType) {
  const { data, success } = clientFormSchema.safeParse(values);
  if (!success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    await prisma.client.create({ data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      cuit: data.cuit === "" ? null : data.cuit,
      companyName: data.companyName,
      IVAcategory: data.IVAcategory,
      priceListId: data.priceListId === "" ? null : data.priceListId,
    } });

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updateClient(values: ClientFormType, clientId: string) {
  if (!values.phone) {
    values.phone = "0";
  }

  const { data, success } = clientFormSchema.safeParse(values);
  if (!success) {
    return { error: "Invalid data" };
  }

  try {
    await prisma.client.update({ where: { id: clientId }, data });

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function deleteClient(clientId: string) {
  try {
    await prisma.client.delete({ where: { id: clientId } });

    revalidatePath("/dashboard/clientes");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function getClientById(id: string): Promise<ClientType | null> {
  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        priceList: true,
      },
    });

    if (!client) return null;

    return JSON.parse(JSON.stringify(client)) as ClientType;
  } catch (error) {
    console.error("Error al obtener cliente:", error);
    return null;
  }
}
