import { Dispatch, SetStateAction } from "react";
import { array, number, object, string, instanceof as instanceof_, z, date, boolean, coerce } from "zod";
import { DepositType } from "../../depositos/lib/zodDeposits";
import { Session } from "next-auth";

export const costRefCurrenciesEnum = z.enum(["ARG", "USD", "BOTH"]);
export type CostRefCurrencies = z.infer<typeof costRefCurrenciesEnum>;

export const productSchema = object({
  id: string(),
  SKU: string(),
  barcode: string(),
  img: string(),
  name: string(),
  cost: number(),
  costUSD: number(),
  costBonus: number(),
  costLogistics: number(),
  costDate: date(),
  costReferenceCurrency: costRefCurrenciesEnum,
  ivaIncluded: number(),
  ivaApplied: number(),
  brand: object({
    id: string(),
    name: string(),
  }),
  categories: array(
    object({
      id: string(),
      name: string(),
    }),
  ),
  discount: boolean(),
  isActive: boolean(),
  isActiveShop: boolean(),
  totalStock: number(),
  stock: array(
    object({
      deposit: object({
        id: string(),
        name: string(),
      }),
      quantity: number(),
    }),
  ),
  invoices: array(
    object({
      invoiceId: string(),
      quantity: number(),
      invoice: object({
        number: number(),
        date: date(),
        status: string(),
        client: object({
          name: string(),
        }),
      }),
    }),
  ),
  stockMovements: array(
    object({
      quantity: number(),
      stockMovement: object({
        date: date(),
        relatedDeposit: string(),
        deposit: object({
          name: string(),
        }),
      }),
    }),
  ),
  priceLists: array(
    object({
      price: number(),
      marginValue: number(),
      priceList: object({
        id: string(),
        name: string(),
        isDefault: boolean(),
      }),
    }),
  ),
});
export type ProductType = z.infer<typeof productSchema>;

export const productFormSchema = object({
  name: string("Nombre requerido").min(1, "Nombre requerido"),
  barcode: string(),
  cost: coerce.number<number>("Number is required"),
  costUSD: coerce.number<number>("Number is required"),
  costBonus: coerce.number<number>("Number is required"),
  costLogistics: coerce.number<number>("Number is required"),
  costDate: date("Number is required"),
  costReferenceCurrency: costRefCurrenciesEnum,
  ivaIncluded: coerce.number<number>("Number is required"),
  ivaApplied: coerce.number<number>("Number is required"),
  marginDefault: coerce.number<number>("Number is required"),
  discount: boolean(),
  isActive: boolean(),
  isActiveShop: boolean(),
  stock: array(
    object({
      depositId: string(),
      depositName: string(),
      quantity: number("Ingrese un Número"),
    }),
  ),
  brandId: string("Marca requerida").min(1, "Marca requerida"),
  categories: array(
    object({
      categoryId: string(),
      name: string(),
    }),
  ).min(1, "Debe seleccionar al menos una categoría"),
  updateBy: string(),
});
export type ProductFormType = z.infer<typeof productFormSchema>;

export const productFromExcelFormSchema = object({
  file: instanceof_(File).refine(
    (file) => {
      return file instanceof File;
    },
    {
      message: "No es un archivo valido",
    },
  ),
}).refine((data) => data.file, {
  message: "Archivo requerido",
  path: ["file"],
});
export type ProductFromExcelFormType = z.infer<typeof productFromExcelFormSchema>;

export const productUpdateFromExcelFormSchema = object({
  file: instanceof_(File).refine(
    (file) => {
      return file instanceof File;
    },
    {
      message: "No es un archivo valido",
    },
  ),
  add: boolean(),
  price: boolean(),
}).refine((data) => data.file, {
  message: "Archivo requerido",
  path: ["file"],
});
export type ProductUpdateFromExcelFormType = z.infer<typeof productUpdateFromExcelFormSchema>;

export type FormProductProps = {
  setOpenModalMenu?: Dispatch<SetStateAction<boolean>>;
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  product?: ProductType;
  deposits?: DepositType[];
  viewModifyButton?: boolean;
  session: Session;
};

export type FormProductFromExcelProps = {
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  session: Session | null;
};

export type HeaderProductsProps = {
  deposits?: DepositType[];
  session: Session;
};

export type ListProductsProps = {
  products: ProductType[];
  session: Session | null;
};

export type StockPerDepositProps = {
  product: ProductType;
};

export const COST_REF_CURRENCIES = {
  ARG: {
    label: "ARG",
    value: "ARG"
  },
  USD: {
    label: "USD",
    value: "USD"
  },
  BOTH: {
    label: "AUTO",
    value: "BOTH"
  },
}satisfies Record<CostRefCurrencies, {label: string, value: string}>;

export const COST_REF_CURRENCY_ITEMS = Object.values(COST_REF_CURRENCIES);
