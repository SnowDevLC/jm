"use server";

import { revalidatePath } from "next/cache";
import { productFormSchema, ProductFormType, ProductType } from "../lib/zodProducts";
import axios from "axios";
import { normalizeBarcode } from "@/lib/utils";
import getNextNumber from "@/lib/getNextNumber";
import { TNcreateProduct, TNdeleteProduct, TNfindProductBySKU, TNupdateProduct } from "@/lib/TNutils";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const toNumber = (value: { toNumber(): number } | number) => (typeof value === "number" ? value : value.toNumber());

const roundPriceUp = (price: number, rounding: number) => {
  if (rounding <= 0) {
    return Math.round((price + Number.EPSILON) * 100) / 100;
  }

  return Math.ceil((price - Number.EPSILON) / rounding) * rounding;
};

export async function createProduct(values: ProductFormType) {
  const { data, success } = productFormSchema.safeParse(values);

  if (!success) {
    return { error: "Invalid data" };
  }

  try {
    const {
      name,
      brandId,
      cost,
      costUSD,
      costBonus,
      costLogistics,
      costReferenceCurrency,
      ivaIncluded,
      ivaApplied,
      marginDefault,
      discount,
      isActiveShop,
      categories,
      stock,
      barcode,
      updateBy,
      isActive,
      costDate,
    } = data;

    const categoryIds = categories.map((category) => category.categoryId);

    await prisma.$transaction(async (tx) => {
      // 1. Obtener configuración y listas existentes.
      const [settings, priceLists] = await Promise.all([
        tx.systemSettings.findFirst({
          include: {
            exchangeRateType: {
              include: {
                rates: {
                  orderBy: { date: "desc" },
                  take: 1,
                  select: { rate: true },
                },
              },
            },
          },
        }),
        tx.priceList.findMany({
          include: {
            marginRules: {
              orderBy: { minBaseMargin: "asc" },
            },
          },
        }),
      ]);

      if (!settings) {
        throw new Error("No se encontró la configuración del sistema");
      }

      const baseList = priceLists.find((list) => list.isDefault);

      if (!baseList) {
        throw new Error("No se encontró la lista de precios base");
      }

      // 2. Calcular costo con cotización vigente.
      const needsExchangeRate = costReferenceCurrency === "USD" || costReferenceCurrency === "BOTH";

      const exchangeRate = settings.exchangeRateType?.rates[0]?.rate ?? 0;

      if (needsExchangeRate && !exchangeRate) {
        throw new Error("No existe una cotización para el tipo de cambio configurado");
      }

      const currentRate = exchangeRate ? toNumber(exchangeRate) : 0;

      const priceRounding = toNumber(settings.priceRounding);

      let grossCost: number;

      switch (costReferenceCurrency) {
        case "ARG":
          grossCost = toNumber(cost);
          break;

        case "USD":
          grossCost = toNumber(costUSD) * currentRate;
          break;

        case "BOTH":
          grossCost = Math.max(toNumber(cost), toNumber(costUSD) * currentRate);
          break;
      }

      const smartCost =
        grossCost *
        (1 + toNumber(ivaIncluded) / 100) *
        (1 - toNumber(costBonus) / 100) *
        (1 + toNumber(costLogistics) / 100) *
        (1 + toNumber(ivaApplied) / 100);

      // 3. Crear producto y relaciones propias.
      const nextNumber = await getNextNumber(tx, "PRODUCT");
      const SKU = `JM${String(nextNumber).padStart(6, "0")}`;

      const product = await tx.product.create({
        data: {
          SKU,
          barcode: barcode === "" ? null : normalizeBarcode(barcode.trim()),
          name: name.trim(),
          cost,
          costUSD,
          costBonus,
          costLogistics,
          costReferenceCurrency,
          ivaIncluded,
          ivaApplied,
          discount,
          isActiveShop,
          updatedBy: updateBy,
          brandId,
          categories: {
            connect: categoryIds.map((id) => ({ id })),
          },
          stock: {
            create: stock.map((item) => ({
              quantity: item.quantity,
              deposit: {
                connect: { id: item.depositId },
              },
            })),
          },
          totalStock: stock.reduce((total, item) => total + item.quantity, 0),
          isActive,
          costDate: costDate ?? new Date(),
        },
      });

      // 4. Calcular relación y precio para cada lista.
      const priceListProducts = priceLists.map((list) => {
        let marginValue: number;
        let price: number;

        // La lista base usa el margen individual recibido del formulario.
        if (list.isDefault) {
          marginValue = marginDefault;
          price = smartCost * (1 + marginValue / 100);
        } else {
          switch (list.marginType) {
            case "PERCENTAGE":
              marginValue = toNumber(list.marginValue);
              price = smartCost * (1 + marginValue / 100);
              break;

            case "FIXED":
              // El importe fijo se suma al costo.
              marginValue = 0;
              price = smartCost + toNumber(list.marginValue);
              break;

            case "DERIVED": {
              const applicableRule = list.marginRules
                .filter((rule) => toNumber(rule.minBaseMargin) <= marginDefault)
                .sort((a, b) => toNumber(b.minBaseMargin) - toNumber(a.minBaseMargin))[0];

              if (!applicableRule) {
                throw new Error(
                  `No hay una regla de margen aplicable para la lista "${list.name}" y el margen base ${marginDefault}%`,
                );
              }

              marginValue = marginDefault * (toNumber(applicableRule.coefficient) / 100);

              price = smartCost * (1 + marginValue / 100);
              break;
            }

            default:
              throw new Error(`Tipo de margen no válido en la lista "${list.name}"`);
          }
        }

        return {
          productId: product.id,
          priceListId: list.id,
          price: roundPriceUp(price, priceRounding),
          marginValue,
          mode: "AUTOMATIC" as const,
        };
      });

      // 5. Crear todas las relaciones en una sola operación.
      if (priceListProducts.length > 0) {
        await tx.priceListProduct.createMany({
          data: priceListProducts,
        });
      }
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/listas-precios");

    return { success: true };
  } catch (error) {
    console.error("Error al crear producto:", error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        error: error.response.data.message || "An error occurred",
      };
    }

    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function updateProduct(values: ProductFormType, productId: string) {
  const { data, success, error: validationError } = productFormSchema.safeParse(values);

  if (!success) {
    return {
      error: "Invalid data",
      details: validationError.flatten(),
    };
  }

  try {
    const {
      name,
      brandId,
      cost,
      costUSD,
      costBonus,
      costLogistics,
      costReferenceCurrency,
      ivaIncluded,
      ivaApplied,
      marginDefault,
      discount,
      isActive,
      isActiveShop,
      categories,
      stock,
      barcode,
      updateBy,
    } = data;

    const categoryIds = categories.map((c) => c.categoryId);

    await prisma.$transaction(async (tx) => {
      // 1. Obtener producto anterior
      const previous = await tx.product.findUnique({
        where: { id: productId },
        include: {
          stock: {
            include: {
              deposit: {
                select: { id: true, name: true },
              },
            },
          },
          brand: { select: { name: true } },
          categories: { select: { id: true, name: true } },
          priceListProducts: true,
        },
      });

      if (!previous) {
        throw new Error("Product not found");
      }

      // 2. Obtener configuración y listas de precios
      const [settings, priceLists] = await Promise.all([
        tx.systemSettings.findFirst({
          include: {
            exchangeRateType: {
              include: {
                rates: {
                  orderBy: { date: "desc" },
                  take: 1,
                  select: { rate: true },
                },
              },
            },
          },
        }),
        tx.priceList.findMany({
          include: {
            marginRules: {
              orderBy: { minBaseMargin: "asc" },
            },
          },
        }),
      ]);

      if (!settings) {
        throw new Error("No se encontró la configuración del sistema");
      }

      const baseList = priceLists.find((list) => list.isDefault);

      if (!baseList) {
        throw new Error("No se encontró la lista de precios base");
      }

      // 3. Obtener cotización vigente
      const needsExchangeRate = costReferenceCurrency === "USD" || costReferenceCurrency === "BOTH";

      const exchangeRate = settings.exchangeRateType?.rates[0]?.rate ?? 0;

      if (needsExchangeRate && !toNumber(exchangeRate)) {
        throw new Error("No existe una cotización para el tipo de cambio configurado");
      }

      const currentRate = toNumber(exchangeRate);
      const priceRounding = toNumber(settings.priceRounding);

      // 4. Calcular costo inteligente
      let grossCost: number;

      switch (costReferenceCurrency) {
        case "ARG":
          grossCost = toNumber(cost);
          break;

        case "USD":
          grossCost = toNumber(costUSD) * currentRate;
          break;

        case "BOTH":
          grossCost = Math.max(toNumber(cost), toNumber(costUSD) * currentRate);
          break;
      }

      const smartCost =
        grossCost *
        (1 + toNumber(ivaIncluded) / 100) *
        (1 - toNumber(costBonus) / 100) *
        (1 + toNumber(costLogistics) / 100) *
        (1 + toNumber(ivaApplied) / 100);

      // 5. Actualizar producto
      const totalStock = stock.reduce((total, item) => total + item.quantity, 0);

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          name: name.trim(),
          brandId,
          categories: {
            set: categoryIds.map((id) => ({ id })),
          },
          cost,
          costUSD,
          costBonus,
          costLogistics,
          costReferenceCurrency,
          ivaIncluded,
          ivaApplied,
          costDate: new Date(),
          discount,
          isActive,
          isActiveShop,
          updatedBy: updateBy,
          barcode: barcode ? normalizeBarcode(barcode.trim()) : null,
          totalStock,
        },
      });

      // 6. Actualizar stock por depósito
      await tx.productStock.deleteMany({
        where: { productId },
      });

      if (stock.length > 0) {
        await tx.productStock.createMany({
          data: stock.map((item) => ({
            productId,
            depositId: item.depositId,
            quantity: item.quantity,
          })),
        });
      }

      // 7. Obtener precios anteriores para preservar los manuales
      const existingPrices = await tx.priceListProduct.findMany({
        where: { productId },
      });

      // 8. Recalcular precios de todas las listas
      for (const list of priceLists) {
        let marginValue: number;
        let price: number;

        if (list.isDefault) {
          marginValue = marginDefault;
          price = smartCost * (1 + marginValue / 100);
        } else {
          switch (list.marginType) {
            case "PERCENTAGE":
              marginValue = toNumber(list.marginValue);
              price = smartCost * (1 + marginValue / 100);
              break;

            case "FIXED":
              marginValue = 0;
              price = smartCost + toNumber(list.marginValue);
              break;

            case "DERIVED": {
              const applicableRule = list.marginRules
                .filter((rule) => toNumber(rule.minBaseMargin) <= marginDefault)
                .sort((a, b) => toNumber(b.minBaseMargin) - toNumber(a.minBaseMargin))[0];

              if (!applicableRule) {
                throw new Error(
                  `No hay una regla de margen aplicable para la lista "${list.name}" y el margen base ${marginDefault}%`,
                );
              }

              marginValue = marginDefault * (toNumber(applicableRule.coefficient) / 100);

              price = smartCost * (1 + marginValue / 100);
              break;
            }

            default:
              throw new Error(`Tipo de margen no válido en la lista "${list.name}"`);
          }
        }

        const existing = existingPrices.find((item) => item.priceListId === list.id);

        // No sobrescribir precios modificados manualmente
        if (existing?.mode === "MANUAL") {
          continue;
        }

        const priceData = {
          price: roundPriceUp(price, priceRounding),
          marginValue,
          mode: "AUTOMATIC" as const,
        };

        if (existing) {
          await tx.priceListProduct.update({
            where: { id: existing.id },
            data: priceData,
          });
        } else {
          await tx.priceListProduct.create({
            data: {
              productId,
              priceListId: list.id,
              ...priceData,
            },
          });
        }
      }

      // 9. Registrar modificaciones
      const prevFlat = {
        name: previous.name,
        brand: previous.brand.name,
        cost: toNumber(previous.cost),
        costUSD: toNumber(previous.costUSD),
        costBonus: toNumber(previous.costBonus),
        costLogistics: toNumber(previous.costLogistics),
        costReferenceCurrency: previous.costReferenceCurrency,
        ivaApplied: toNumber(previous.ivaApplied),
        ivaIncluded: toNumber(previous.ivaIncluded),
        discount: previous.discount,
        isActive: previous.isActive,
        isActiveShop: previous.isActiveShop,
        barcode: previous.barcode,
        totalStock: previous.totalStock,
        updatedBy: previous.updatedBy,
      };

      const newFlat = {
        name: name.trim(),
        brand: (
          await tx.brand.findUnique({
            where: { id: brandId },
            select: { name: true },
          })
        )?.name,
        cost,
        costUSD,
        costBonus,
        costLogistics,
        costReferenceCurrency,
        ivaApplied,
        ivaIncluded,
        discount,
        isActive,
        isActiveShop,
        barcode: barcode ? normalizeBarcode(barcode.trim()) : null,
        totalStock,
        updatedBy: updateBy,
      };

      const diffData: Record<string, unknown> = {};

      for (const key of Object.keys(prevFlat) as (keyof typeof prevFlat)[]) {
        if (JSON.stringify(prevFlat[key]) !== JSON.stringify(newFlat[key])) {
          diffData[key] = {
            before: prevFlat[key],
            after: newFlat[key],
          };
        }
      }

      const previousStock = previous.stock.map((item) => ({
        depositId: item.depositId,
        depositName: item.deposit.name,
        quantity: toNumber(item.quantity),
      }));

      const stockDiff = stock.flatMap((item) => {
        const previousItem = previousStock.find((old) => old.depositId === item.depositId);

        if (!previousItem || previousItem.quantity === item.quantity) {
          return [];
        }

        return [
          {
            depositName: item.depositName,
            before: previousItem.quantity,
            after: item.quantity,
          },
        ];
      });

      if (stockDiff.length > 0) {
        diffData.stock = stockDiff;
      }

      const diff = diffData as Prisma.InputJsonObject;

      if (Object.keys(diff).length > 0 && updateBy) {
        await tx.productModification.create({
          data: {
            productId,
            userId: updateBy,
            diff,
            observation: "Actualización de producto",
          },
        });
      }
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/listas-precios");

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar producto:", error);

    if (axios.isAxiosError(error) && error.response) {
      return {
        error: error.response.data.message || "An error occurred",
      };
    }

    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return { success: false, error: "Producto no encontrado" };
    }
    if (product.isActiveShop) {
      await TNdeleteProduct(product.SKU);
    }
    await prisma.productStock.deleteMany({
      where: { productId },
    });
    await prisma.product.update({ where: { id: productId }, data: { isActive: false } });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return { error: error.response.data.message || "An error occurred" };
    }
    return { error: "An unexpected error occurred" };
  }
}

export async function refreshDataServer() {
  revalidatePath("/dashboard/products");
}

export async function getProductById(id: string): Promise<ProductType | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        categories: true,
        stock: {
          include: {
            deposit: true,
          },
        },
        priceLists: {
          include: {
            priceList: true,
          },
        },
      },
    });

    if (!product) return null;

    return JSON.parse(JSON.stringify(product)) as ProductType;
  } catch (error) {
    console.error("Error al obtener producto:", error);
    return null;
  }
}

// export async function createProduct(values: ProductFormType) {
//   const { data, success } = productFormSchema.safeParse(values);
//   if (!success) {
//     return { error: "Invalid data" };
//   }
//   try {
//     const {
//       name,
//       brandId,
//       cost,
//       costUSD,
//       costBonus,
//       costLogistics,
//       ivaIncluded,
//       ivaApplied,
//       discount,
//       stock,
//       barcode,
//       isActiveShop,
//       supplierId,
//       categories,
//       updateBy,
//       checkExchangeRate,
//     } = data;
//     const categoryIds = categories.map((c) => c.categoryId);
//     const tnCategories = categories.map((c) => c.name);
//     await prisma.$transaction(async (tx) => {
//       const nextNumber = await getNextNumber(tx, "product");
//       const SKU = `GEL${String(nextNumber).padStart(6, "0")}`;
//       await tx.product.create({
//         data: {
//           SKU,
//           barcode: barcode === "" ? null : normalizeBarcode(barcode.trim()),
//           name: name.trim(),
//           cost,
//           costUSD,
//           costBonus,
//           costLogistics,
//           ivaIncluded,
//           ivaApplied,
//           discount,
//           isActiveShop,
//           updatedBy: updateBy,
//           brandId,
//           supplierId,
//           checkExchangeRate,
//           categories: {
//             connect: categoryIds.map((id) => ({ id })),
//           },
//           stock: {
//             create: stock.map((item: { depositId: string; quantity: number }) => ({
//               quantity: item.quantity,
//               deposit: {
//                 connect: { id: item.depositId },
//               },
//             })),
//           },
//           totalStock: stock.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0),
//         },
//       });
//       // if (isActiveShop) {
//       //   const product = await TNfindProductBySKU(SKU);
//       //   if (!product) {
//       //     await TNcreateProduct({
//       //       name,
//       //       categories: tnCategories,
//       //       cost,
//       //       price: 0,
//       //       totalStock: stock.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0),
//       //       SKU,
//       //       isActiveShop,
//       //     });
//       //   }
//       // }
//     });
//     revalidatePath("/dashboard/products");
//     return { success: true };
//   } catch (error) {
//     if (axios.isAxiosError(error) && error.response) {
//       return { error: error.response.data.message || "An error occurred" };
//     }
//     return { error: "An unexpected error occurred" };
//   }
// }

// export async function updateProduct(values: ProductFormType, productId: string) {
//   const { data, success } = productFormSchema.safeParse(values);
//   if (!success) {
//     return { error: "Invalid data" };
//   }
//   try {
//     const {
//       name,
//       brandId,
//       cost,
//       costUSD,
//       costBonus,
//       costLogistics,
//       ivaIncluded,
//       ivaApplied,
//       discount,
//       stock,
//       barcode,
//       isActiveShop,
//       categories,
//       updateBy,
//       costDate,
//     } = data;
//     const categoryIds = categories.map((c) => c.categoryId);
//     const tnCategories = categories.map((c) => c.name);
//     const previous = await prisma.product.findUnique({
//       where: { id: productId },
//       include: {
//         stock: {
//           include: {
//             deposit: {
//               select: {
//                 id: true,
//                 name: true,
//               },
//             },
//           },
//         },
//         brand: { select: { name: true } },
//         categories: { select: { id: true, name: true } },
//       },
//     });
//     if (!previous) {
//       return { error: "Product not found" };
//     }
//     await prisma.productStock.deleteMany({
//       where: { productId },
//     });
//     const stockOperations = stock.map((item: { depositId: string; quantity: number }) => {
//       return prisma.productStock.create({
//         data: {
//           product: { connect: { id: productId } },
//           deposit: { connect: { id: item.depositId } },
//           quantity: item.quantity,
//         },
//       });
//     });
//     await Promise.all(stockOperations);

//     const updateCostDate = new Date();
//     const updatedProduct = await prisma.product.update({
//       where: { id: productId },
//       data: {
//         name,
//         brandId,
//         categories: {
//           set: categoryIds.map((id) => ({ id })),
//         },
//         cost,
//         costUSD,
//         costBonus,
//         costLogistics,
//         ivaApplied,
//         ivaIncluded,
//         costDate: updateCostDate,
//         discount,
//         isActiveShop,
//         barcode: barcode === "" ? null : normalizeBarcode(barcode.trim()),
//         totalStock: stock.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0),
//       },
//     });
//     if (!updatedProduct) {
//       return { error: "Product not updated" };
//     }
//     const prevFlat = {
//       name: previous.name,
//       brand: previous.brand.name,
//       cost: previous.cost,
//       costUSD: previous.costUSD,
//       costBonus: previous.costBonus,
//       costLogistics: previous.costLogistics,
//       ivaApplied: previous.ivaApplied,
//       ivaIncluded: previous.ivaIncluded,
//       discount: previous.discount,
//       barcode: previous.barcode,
//       isActiveShop: previous.isActiveShop,
//       totalStock: previous.totalStock,
//       updatedBy: previous.updatedBy,
//     };
//     const newFlat = {
//       name,
//       brand: (await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } }))?.name,
//       cost,
//       costUSD,
//       costBonus,
//       costLogistics,
//       ivaApplied,
//       ivaIncluded,
//       discount,
//       barcode: barcode === "" ? null : normalizeBarcode(barcode.trim()),
//       isActiveShop,
//       totalStock: stock.reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0),
//       updatedBy: updateBy,
//     };
//     const diff: any = {};
//     for (const key of Object.keys(prevFlat) as (keyof typeof prevFlat)[]) {
//       if (JSON.stringify(prevFlat[key]) !== JSON.stringify(newFlat[key])) {
//         diff[key] = {
//           before: prevFlat[key],
//           after: newFlat[key],
//         };
//       }
//     }
//     const prevStock = previous.stock.map((s) => ({
//       depositName: s.deposit.name,
//       quantity: s.quantity,
//     }));
//     const newStock = stock.map((s: any) => ({
//       depositName: s.depositName,
//       quantity: s.quantity,
//     }));
//     const stockDiff: any[] = [];
//     prevStock.forEach((prevItem) => {
//       const newItem = newStock.find(
//         (s: { depositName: string; quantity: number }) => s.depositName === prevItem.depositName,
//       );
//       if (!newItem) return;
//       if (prevItem.quantity !== newItem.quantity) {
//         stockDiff.push({
//           depositName: prevItem.depositName,
//           before: prevItem.quantity,
//           after: newItem.quantity,
//         });
//       }
//     });
//     if (stockDiff.length > 0) {
//       diff.stock = stockDiff;
//     }
//     if (Object.keys(diff).length > 0) {
//       if (updateBy) {
//         await prisma.productModification.create({
//           data: { productId, userId: updateBy, diff, observation: "Actualización de producto" },
//         });
//       }
//     }
//     // if (isActiveShop || prevFlat.isActiveShop) {
//     //   const productTN = await TNfindProductBySKU(String(updatedProduct.SKU));
//     //   if (!productTN) {
//     //     await TNcreateProduct({
//     //       name,
//     //       categories: tnCategories,
//     //       cost,
//     //       price: 0,
//     //       totalStock: newFlat.totalStock,
//     //       SKU: String(updatedProduct.SKU),
//     //       isActiveShop,
//     //     });
//     //   } else {
//     //     const dataTN: any = {};
//     //     if (previous.name !== name) dataTN.name = name;
//     //     if (previous.cost !== cost) dataTN.cost = cost;
//     //     if (previous.totalStock !== updatedProduct.totalStock) dataTN.totalStock = updatedProduct.totalStock;
//     //     if (previous.isActiveShop !== isActiveShop) dataTN.isActiveShop = isActiveShop;
//     //     const prevCats = previous.categories.map((c) => c.name).sort();
//     //     const newCats = tnCategories.slice().sort();
//     //     if (JSON.stringify(prevCats) !== JSON.stringify(newCats)) {
//     //       dataTN.categories = tnCategories;
//     //     }
//     //     if (Object.keys(dataTN).length > 0) {
//     //       await TNupdateProduct(productTN, dataTN);
//     //     }
//     //   }
//     // }
//     revalidatePath("/dashboard/products");
//     return { success: true };
//   } catch (error) {
//     return { error: "An unexpected error occurred" };
//   }
// }
