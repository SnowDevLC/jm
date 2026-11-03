import { Dispatch, SetStateAction } from "react";
import { object, string, z, enum as enum_, array, date, number, boolean } from "zod";

export const ivaConditionsEnum = z.enum([
  "RESPONSABLE_INSCRIPTO",
  "MONOTRIBUTO",
  "CONSUMIDOR_FINAL",
  "EXENTO",
  "SIN_CATEGORIA",
]);

export type IvaConditions = z.infer<typeof ivaConditionsEnum>;

export const clientSchema = object({
  id: string(),
  name: string(),
  email: string().email(),
  phone: string(),
  balance: number(),
  cuit: string(),
  companyName: string(),
  IVAcategory: ivaConditionsEnum,
  address: string(),
  priceList: object({
    id: string(),
    name: string(),
  }),
  orders: array(
    object({
      id: string(),
      number: string(),
      date: date(),
      total: number(),
      status: string(),
    }),
  ),
  payments: array(
    object({
      id: string(),
      number: number(),
      date: date(),
      total: number(),
      user: object({
        name: string(),
      }),
    }),
  ),
});
export type ClientType = z.infer<typeof clientSchema>;

export const clientFormSchema = object({
  name: string("Nombre requirido").min(1, "Nombre requerido"),
  email: string(),
  phone: string(),
  address: string(),
  cuit: string().optional(),
  companyName: string(),
  IVAcategory: ivaConditionsEnum,
  priceListId: string().optional(),
});
export type ClientFormType = z.infer<typeof clientFormSchema>;

export type FormClientProps = {
  setOpenModalMenu?: Dispatch<SetStateAction<boolean>>;
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  client?: ClientType;
  viewModifyButton?: boolean;
};

export const IVA_CONDITIONS_CLIENT = {
  RESPONSABLE_INSCRIPTO: {
    label: "Responsable Inscripto",
    value: "RESPONSABLE_INSCRIPTO",
  },
  MONOTRIBUTO: {
    label: "Responsable Monotributo",
    value: "MONOTRIBUTO",
  },
  CONSUMIDOR_FINAL: {
    label: "Consumidor Final",
    value: "CONSUMIDOR_FINAL",
  },
  EXENTO: {
    label: "IVA Sujeto Exento",
    value: "EXENTO",
  },
  SIN_CATEGORIA: {
    label: "Sin Categoria",
    value: "SIN_CATEGORIA",
  },
} satisfies Record<IvaConditions, { label: string; value: string }>;

export const IVA_CONDITIONS_CLIENT_ITEMS = Object.values(IVA_CONDITIONS_CLIENT);
