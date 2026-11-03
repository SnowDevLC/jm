import prisma from "@/lib/prisma";
import { ExchangeRateTypeType, SystemSettingsType } from "./zodConfig";

export async function getSystemSettings(): Promise<SystemSettingsType | null> {
  try {
    const systemSetting = await prisma.systemSettings.findFirst({
      select: {
        id: true,
        name: true,
        cuit: true,
        address: true,
        pointWebService: true,
        ivaCondition: true,
        startActivity: true,
        priceRounding: true,
        marginDefault: true,
        exchangeRateType: {
          select: {
            id: true,
            name: true,
          },
        },
        priceListTN: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return JSON.parse(JSON.stringify(systemSetting)) as SystemSettingsType;
  } catch (error) {
    return null;
  }
}

export async function getExchangeRateTypes(): Promise<ExchangeRateTypeType[]> {
  try {
    const data = await prisma.exchangeRateType.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        source: true,
        updateEvery: true,
      },
    });

    return JSON.parse(JSON.stringify(data)) as ExchangeRateTypeType[];
  } catch (error) {
    return [];
  }
}
