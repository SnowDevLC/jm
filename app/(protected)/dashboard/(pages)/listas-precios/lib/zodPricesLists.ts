import { Dispatch, SetStateAction } from "react";
import { boolean, coerce, number, object, string, z } from "zod";
import { ProductType } from "../../productos/lib/zodProducts";

export const marginsTypeEnum = z.enum(["BASE", "DERIVED", "PERCENTAGE", "FIXED"]);
export type MarginsTypes = z.infer<typeof marginsTypeEnum>;

export const pricesListFormTypeEnum = z.enum(["DERIVED", "PERCENTAGE", "FIXED"]);

// =====================================================
// MARGIN RULES
// =====================================================

export const priceListMarginRuleSchema = object({
  minBaseMargin: coerce.number<number>().min(0, "El margen mínimo no puede ser negativo"),
  coefficient: coerce.number<number>()
    .gt(0, "El coeficiente debe ser mayor que cero")
    .max(100, "El coeficiente no puede superar el 100%"),
});

export type PriceListMarginRuleType = z.infer<typeof priceListMarginRuleSchema>;

export const pricesListSchema = object({
  id: string(),
  name: string(),
  description: string(),
  isDefault: boolean(),
  marginType: marginsTypeEnum,
  marginValue: number(),
  marginRules: z.array(priceListMarginRuleSchema).optional(),
});
export type PricesListType = z.infer<typeof pricesListSchema>;

export const pricesListFormSchema = object({
  name: string().trim().min(1, "El nombre es obligatorio").max(100, "El nombre no puede superar los 100 caracteres"),
  description: string(),
  marginType: pricesListFormTypeEnum,
  marginValue: coerce.number<number>().min(0, "El valor no puede ser negativo"),
  marginRules: z.array(priceListMarginRuleSchema).optional(),
}).superRefine((values, ctx) => {
  if (values.marginType !== "DERIVED") {
    return;
  }

  const rules = values.marginRules ?? [];
  if (rules.length === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["marginRules"],
      message: "Agregá al menos una regla para la lista derivada",
    });
    return;
  }

  const thresholds = new Set<number>();
  rules.forEach((rule, index) => {
    if (thresholds.has(rule.minBaseMargin)) {
      ctx.addIssue({
        code: "custom",
        path: ["marginRules", index, "minBaseMargin"],
        message: "No puede haber dos reglas con el mismo margen mínimo",
      });
    }

    thresholds.add(rule.minBaseMargin);
  });
});

export type PricesListFormType = z.infer<typeof pricesListFormSchema>;

export type FormPricesListProps = {
  setOpenModalMenu?: Dispatch<SetStateAction<boolean>>;
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  pricesList?: PricesListType;
};

export type ListPricesListProps = {
  pricesList: PricesListType[];
};

export type ListProductsByPricesListProps = {
  products: ProductType[];
  priceLists: any;
};

export const MARGINS_TYPES = {
  BASE: {
    label: "BASE",
    value: "BASE",
  },
  DERIVED: {
    label: "DERIVADA",
    value: "DERIVED",
  },
  PERCENTAGE: {
    label: "PORCENTAJE",
    value: "PERCENTAGE",
  },
  FIXED: {
    label: "MONTO FIJO",
    value: "FIXED",
  },
} satisfies Record<MarginsTypes, { label: string; value: string }>;

export const MARGINS_TYPES_ITEMS = Object.values(MARGINS_TYPES);

export const FORM_MARGINS_TYPES_ITEMS = MARGINS_TYPES_ITEMS.filter((item) => item.value !== "BASE");
