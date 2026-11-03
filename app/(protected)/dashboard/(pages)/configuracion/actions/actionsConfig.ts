"use server";

import prisma from "@/lib/prisma";
import {
  ExchangeRateTypeFormType,
  SystemSettingsFormType,
  exchangeRateTypeFormSchema,
  systemSettingsFormSchema,
} from "../lib/zodConfig";
import { revalidatePath } from "next/cache";

export async function updateSystemSettings(values: SystemSettingsFormType, systemSettingsId: string) {
  const { data, success } = systemSettingsFormSchema.safeParse(values);
  if (!success) {
    return { error: "Invalid data" };
  }

  try {
    await prisma.systemSettings.update({
      where: { id: systemSettingsId },
      data: {
        name: data.name,
        cuit: data.cuit,
        address: data.address,
        pointWebService: data.pointWebService,
        ivaCondition: data.ivaCondition,
        startActivity: data.startActivity,
        priceRounding: data.priceRounding,
        marginDefault: data.marginDefault,
        exchangeRateTypeId: data.exchangeRateTypeId === "" ? null : data.exchangeRateTypeId,
        priceListTNId: data.priceListTNId === "" ? null : data.priceListTNId,
      },
    });

    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Ocurrio un error" };
  }
}

export async function createExchangeRateType(values: ExchangeRateTypeFormType) {
  const { data, success } = exchangeRateTypeFormSchema.safeParse(values);
  if (!success) {
    return { error: "Invalid data" };
  }

  try {
    await prisma.exchangeRateType.create({
      data: {
        name: data.name,
        description: data.description,
        source: data.source,
        provider: data.provider,
        updateEvery: data.updateEvery,
      },
    });

    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Ocurrio un error" };
  }
}

export async function updateExchangeRateType(values: ExchangeRateTypeFormType, exchangeRateTypeId: string) {
  const { data, success } = exchangeRateTypeFormSchema.safeParse(values);
  if (!success) {
    return { error: "Invalid data" };
  }

  try {
    await prisma.exchangeRateType.update({
      where: { id: exchangeRateTypeId },
      data: {
        name: data.name,
        description: data.description,
        source: data.source,
        provider: data.provider,
        updateEvery: data.updateEvery,
      },
    });

    revalidatePath("/dashboard/configuracion");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Ocurrio un error" };
  }
}
