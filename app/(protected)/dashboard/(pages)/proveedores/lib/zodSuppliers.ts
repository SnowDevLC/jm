import { Dispatch, SetStateAction } from "react";
import { object, string, z, enum as enum_, array, date, number } from "zod";

export const ivaConditionsEnum = z.enum([
  "RESPONSABLE_INSCRIPTO",
  "MONOTRIBUTO",
  "CONSUMIDOR_FINAL",
  "EXENTO",
  "SIN_CATEGORIA",
]);

export type IvaConditions = z.infer<typeof ivaConditionsEnum>;

export const typesEnum = z.enum([
  "CLIENTE",
  "PROVEEDOR",
  "AMBOS",
]);

export type TypesPartners = z.infer<typeof typesEnum>;

export const supplierSchema = object({
  id: string(),
  name: string(),
  email: string().email(),
  phone: string(),
  balance: number(),
  cuit: string(),
  companyName: string(),
  IVAcategory: ivaConditionsEnum,
  type: typesEnum,
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
    })
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
    })
  ),
});
export type SupplierType = z.infer<typeof supplierSchema>;