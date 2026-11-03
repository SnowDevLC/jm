"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { pricesListFormSchema, PricesListFormType } from "../lib/zodPricesLists";
import { Prisma } from "@prisma/client";

const toNumber = (value: Prisma.Decimal | number | string) => Number(value);

const roundPriceUp = (price: number, rounding: number) => {
  if (rounding <= 0) {
    return Math.round((price + Number.EPSILON) * 100) / 100;
  }

  return Math.ceil((price - Number.EPSILON) / rounding) * rounding;
};

export async function createPricesList(values: PricesListFormType) {
  const { data, success } = pricesListFormSchema.safeParse(values);
  if (!success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const nameUpper = data.name.trim().toUpperCase();

      // Verificar nombre duplicado.
      const existingList = await tx.priceList.findFirst({
        where: {
          name: {
            equals: nameUpper,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (existingList) {
        throw new Error(`La Lista de Precios con el nombre - ${nameUpper} - ya existe`);
      }

      // Obtener todos los productos existentes.
      const products = await tx.product.findMany({
        select: {
          id: true,
          cost: true,
          costUSD: true,
          costBonus: true,
          costLogistics: true,
          ivaApplied: true,
          ivaIncluded: true,
          costReferenceCurrency: true,
        },
      });

      // Obtener la configuración y la última cotización global.
      const settings = await tx.systemSettings.findFirst({
        include: {
          exchangeRateType: {
            include: {
              rates: {
                orderBy: { date: "desc" },
                take: 1,
                select: { rate: true, date: true },
              },
            },
          },
        },
      });

      const priceRounding = settings ? Number(settings.priceRounding) : 0;

      const needsExchangeRate = products.some(
        (product) => product.costReferenceCurrency === "USD" || product.costReferenceCurrency === "BOTH",
      );

      const exchangeRate = settings?.exchangeRateType.rates[0]?.rate;

      if (needsExchangeRate && !exchangeRate) {
        throw new Error("No existe una cotización para el tipo de cambio configurado en el sistema");
      }

      const currentRate = exchangeRate ? toNumber(exchangeRate) : 0;

      // Preparar los márgenes base si la lista es derivada.
      let baseMargins = new Map<string, number>();

      if (data.marginType === "DERIVED") {
        const baseList = await tx.priceList.findFirst({
          where: { isDefault: true },
          select: {
            id: true,
            products: {
              select: {
                productId: true,
                marginValue: true,
              },
            },
          },
        });

        if (!baseList) {
          throw new Error("No se encontró la lista de precios base");
        }

        baseMargins = new Map(baseList.products.map((item) => [item.productId, toNumber(item.marginValue)]));

        const missingMargin = products.find((product) => !baseMargins.has(product.id));

        if (missingMargin) {
          throw new Error("La lista base no tiene margen configurado para todos los productos");
        }
      }

      const marginRules = data.marginRules ?? [];

      // Crear la lista y sus reglas en la misma transacción.
      const priceList = await tx.priceList.create({
        data: {
          name: nameUpper,
          description: data.description,
          marginType: data.marginType,
          marginValue: data.marginType === "DERIVED" ? 0 : data.marginValue,
          ...(data.marginType === "DERIVED" && {
            marginRules: {
              create: marginRules.map((rule) => ({
                minBaseMargin: rule.minBaseMargin,
                coefficient: rule.coefficient,
              })),
            },
          }),
        },
        select: { id: true },
      });

      // Calcular el precio inicial de cada producto.
      const priceListProducts = products.map((product) => {
        const cost = toNumber(product.cost);
        const costUSD = toNumber(product.costUSD);
        const bonus = toNumber(product.costBonus);
        const logistics = toNumber(product.costLogistics);
        const ivaApplied = toNumber(product.ivaApplied);
        const ivaIncluded = toNumber(product.ivaIncluded);

        let grossCost: number;

        switch (product.costReferenceCurrency) {
          case "ARG":
            grossCost = cost;
            break;

          case "USD":
            grossCost = costUSD * currentRate;
            break;

          case "BOTH":
            grossCost = Math.max(cost, costUSD * currentRate);
            break;
        }

        // Costo inteligente.
        const smartCost =
          grossCost * (1 - bonus / 100) * (1 + logistics / 100) * (1 + ivaApplied / 100 - ivaIncluded / 100);

        let price: number;
        let productMargin = 0;

        switch (data.marginType) {
          case "PERCENTAGE": {
            productMargin = data.marginValue;
            price = smartCost * (1 + data.marginValue / 100);
            break;
          }

          case "FIXED": {
            price = smartCost + data.marginValue;
            break;
          }

          case "DERIVED": {
            const baseMargin = baseMargins.get(product.id)!;

            // La regla aplicable es la de mayor umbral
            // que no supere el margen base del producto.
            const applicableRule = marginRules
              .filter((rule) => rule.minBaseMargin <= baseMargin)
              .sort((a, b) => b.minBaseMargin - a.minBaseMargin)[0];

            if (!applicableRule) {
              throw new Error(`No hay una regla de margen aplicable para el producto ${product.id}`);
            }

            productMargin = baseMargin * (applicableRule.coefficient / 100);

            price = smartCost * (1 + productMargin / 100);
            break;
          }
        }

        return {
          priceListId: priceList.id,
          productId: product.id,
          price: roundPriceUp(price, priceRounding),
          marginValue: productMargin,
          mode: "AUTOMATIC" as const,
        };
      });

      // Crear todos los precios de una sola vez.
      if (priceListProducts.length > 0) {
        await tx.priceListProduct.createMany({
          data: priceListProducts,
        });
      }
    });

    revalidatePath("/dashboard/listas-precios");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}

export async function updatePricesList(id: string, values: PricesListFormType) {
  const { data, success } = pricesListFormSchema.safeParse(values);

  if (!success) {
    return { success: false, error: "Invalid data" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const nameUpper = data.name.trim().toUpperCase();

      // Verificar que la lista exista.
      const currentList = await tx.priceList.findUnique({
        where: { id },
        select: {
          id: true,
          isDefault: true,
        },
      });

      if (!currentList) {
        throw new Error("No se encontró la lista de precios");
      }

      // Verificar nombre duplicado, excluyendo la lista actual.
      const existingList = await tx.priceList.findFirst({
        where: {
          id: { not: id },
          name: {
            equals: nameUpper,
            mode: "insensitive",
          },
        },
        select: { id: true },
      });

      if (existingList) {
        throw new Error(`La Lista de Precios con el nombre - ${nameUpper} - ya existe`);
      }

      // Obtener los productos y los precios actuales de la lista.
      const [products, currentProducts] = await Promise.all([
        tx.product.findMany({
          select: {
            id: true,
            cost: true,
            costUSD: true,
            costBonus: true,
            costLogistics: true,
            ivaApplied: true,
            ivaIncluded: true,
            costReferenceCurrency: true,
          },
        }),

        tx.priceListProduct.findMany({
          where: { priceListId: id },
          select: {
            id: true,
            productId: true,
            price: true,
            marginValue: true,
            mode: true,
          },
        }),
      ]);

      const currentProductsMap = new Map(currentProducts.map((item) => [item.productId, item]));

      // Obtener configuración y última cotización global.
      const settings = await tx.systemSettings.findFirst({
        include: {
          exchangeRateType: {
            include: {
              rates: {
                orderBy: { date: "desc" },
                take: 1,
                select: { rate: true, date: true },
              },
            },
          },
        },
      });

      const priceRounding = settings ? Number(settings.priceRounding) : 0;

      const needsExchangeRate = products.some(
        (product) => product.costReferenceCurrency === "USD" || product.costReferenceCurrency === "BOTH",
      );

      const exchangeRate = settings?.exchangeRateType.rates[0]?.rate;

      if (needsExchangeRate && !exchangeRate) {
        throw new Error("No existe una cotización para el tipo de cambio configurado en el sistema");
      }

      const currentRate = exchangeRate ? toNumber(exchangeRate) : 0;

      // Obtener los márgenes de la lista base, si corresponde.
      let baseMargins = new Map<string, number>();

      if (data.marginType === "DERIVED") {
        const baseList = await tx.priceList.findFirst({
          where: { isDefault: true },
          select: {
            id: true,
            products: {
              select: {
                productId: true,
                marginValue: true,
              },
            },
          },
        });

        if (!baseList) {
          throw new Error("No se encontró la lista de precios base");
        }

        if (baseList.id === id) {
          throw new Error("La lista predeterminada no puede derivar sus márgenes de sí misma");
        }

        baseMargins = new Map(baseList.products.map((item) => [item.productId, toNumber(item.marginValue)]));

        const missingMargin = products.find((product) => !baseMargins.has(product.id));

        if (missingMargin) {
          throw new Error("La lista base no tiene margen configurado para todos los productos");
        }
      }

      const marginRules = [...(data.marginRules ?? [])].sort((a, b) => a.minBaseMargin - b.minBaseMargin);

      // Actualizar los datos generales.
      await tx.priceList.update({
        where: { id },
        data: {
          name: nameUpper,
          description: data.description,
          marginType: data.marginType,
          marginValue: data.marginType === "DERIVED" ? 0 : data.marginValue,
        },
      });

      // Reemplazar las reglas de margen de la lista.
      await tx.priceListMarginRule.deleteMany({
        where: { priceListId: id },
      });

      if (data.marginType === "DERIVED" && marginRules.length > 0) {
        await tx.priceListMarginRule.createMany({
          data: marginRules.map((rule) => ({
            priceListId: id,
            minBaseMargin: rule.minBaseMargin,
            coefficient: rule.coefficient,
          })),
        });
      }

      // Calcular y guardar los precios.
      for (const product of products) {
        const existingProduct = currentProductsMap.get(product.id);

        // Los precios manuales no se recalculan ni se sobrescriben.
        if (existingProduct?.mode === "MANUAL") {
          continue;
        }

        const cost = toNumber(product.cost);
        const costUSD = toNumber(product.costUSD);
        const bonus = toNumber(product.costBonus);
        const logistics = toNumber(product.costLogistics);
        const ivaApplied = toNumber(product.ivaApplied);
        const ivaIncluded = toNumber(product.ivaIncluded);

        let grossCost: number;

        switch (product.costReferenceCurrency) {
          case "ARG":
            grossCost = cost;
            break;

          case "USD":
            grossCost = costUSD * currentRate;
            break;

          case "BOTH":
            grossCost = Math.max(cost, costUSD * currentRate);
            break;
        }

        const smartCost =
          grossCost * (1 - bonus / 100) * (1 + logistics / 100) * (1 + ivaApplied / 100 - ivaIncluded / 100);

        let price: number;
        let productMargin = 0;

        switch (data.marginType) {
          case "PERCENTAGE": {
            productMargin = data.marginValue;
            price = smartCost * (1 + data.marginValue / 100);
            break;
          }

          case "FIXED": {
            price = smartCost + data.marginValue;
            break;
          }

          case "DERIVED": {
            const baseMargin = baseMargins.get(product.id)!;

            const applicableRule = marginRules
              .filter((rule) => rule.minBaseMargin <= baseMargin)
              .sort((a, b) => b.minBaseMargin - a.minBaseMargin)[0];

            if (!applicableRule) {
              throw new Error(`No hay una regla de margen aplicable para el producto ${product.id}`);
            }

            productMargin = baseMargin * (applicableRule.coefficient / 100);

            price = smartCost * (1 + productMargin / 100);
            break;
          }
        }

        const roundedPrice = roundPriceUp(price, priceRounding);

        if (existingProduct) {
          await tx.priceListProduct.update({
            where: { id: existingProduct.id },
            data: {
              price: roundedPrice,
              marginValue: productMargin,
              mode: "AUTOMATIC",
            },
          });
        } else {
          // Incorporar productos nuevos que todavía no estén en la lista.
          await tx.priceListProduct.create({
            data: {
              priceListId: id,
              productId: product.id,
              price: roundedPrice,
              marginValue: productMargin,
              mode: "AUTOMATIC",
            },
          });
        }
      }
    });

    revalidatePath("/dashboard/listas-precios");

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar lista de precios:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Ocurrió un error inesperado al actualizar la lista de precios",
    };
  }
}

export async function deletePricesList(pricesListId: string) {
  try {
    await prisma.priceList.update({
      where: { id: pricesListId },
      data: { isActive: false },
    });

    revalidatePath("/dashboard/config");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
