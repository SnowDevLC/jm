import { Dispatch, SetStateAction } from "react";
import { array, boolean, coerce, date, number, object, string, z } from "zod";

// PARAMETERS TYPES //

export const parametersTypeEnum = z.enum(["PERCENTAGE", "FIXED", "FACTOR"]);
export type ParametersTypes = z.infer<typeof parametersTypeEnum>;

export const parametersBaseEnum = z.enum(["COST", "PRICE"]);
export type ParametersBase = z.infer<typeof parametersBaseEnum>;

export const parameterSchema = object({
  id: string(),
  name: string(),
  descripcion: string(),
  type: parametersTypeEnum,
  base: parametersBaseEnum,
  value: number(),
  isActive: boolean(),
});
export type ParameterType = z.infer<typeof parameterSchema>;

export const parameterFormSchema = object({
  name: string("Nombre requirido").min(1, "Nombre requerido"),
  description: string(),
  type: parametersTypeEnum,
  base: parametersBaseEnum,
  value: coerce.number<number>("Number is required"),
  isActive: boolean(),
});
export type ParameterFormType = z.infer<typeof parameterFormSchema>;



// SYSTEM SETTINGS TYPES //

export const ivaConditionsEnum = z.enum(["NC", "MT", "RI"]);
export type IvaConditions = z.infer<typeof ivaConditionsEnum>;

export const systemSettingsSchema = object({
  id: string(),
  name: string(),
  cuit: string(),
  address: string(),
  pointWebService: number(),
  ivaCondition: ivaConditionsEnum,
  startActivity: date(),
  priceRounding: number(),
  marginDefault: number(),
  exchangeRateType: object({
    id: string(),
    name: string(),
  }),
  priceListTN: object({
    id: string(),
    name: string(),
  }),
});

export type SystemSettingsType = z.infer<typeof systemSettingsSchema>;

export const systemSettingsFormSchema = object({
  name: string(),
  cuit: string(),
  address: string(),
  pointWebService: coerce.number<number>(),
  ivaCondition: ivaConditionsEnum,
  startActivity: date(),
  priceRounding: coerce.number<number>(),
  marginDefault: coerce.number<number>(),
  exchangeRateTypeId: string().optional(),
  priceListTNId: string().optional(),
});

export type SystemSettingsFormType = z.infer<typeof systemSettingsFormSchema>;

export const IVA_CONDITIONS = {
  RI: {
    label: "Responsable Inscripto",
    value: "REI",
  },
  MT: {
    label: "Responsable Monotributo",
    value: "MT",
  },
  NC: {
    label: "Sin Condición",
    value: "NC",
  },
} satisfies Record<IvaConditions, { label: string; value: string }>;

export const IVA_CONDITIONS_ITEMS = Object.values(IVA_CONDITIONS);


// EXCHANGE RATES TYPES //

export const exchangeRateSourceEnum = z.enum(["AUTOMATIC", "MANUAL"]);
export type ExchangeRateSources = z.infer<typeof exchangeRateSourceEnum>;

export const exchangeRateTypeSchema = object({
  id: string(),
  name: string(),
  description: string(),
  isActive: boolean(),
  source: exchangeRateSourceEnum,
  updateEvery: number(),
  provider: string(),
  rates: array(
    object({
      id: string(),
      rate: number(),
      date: date(),
    })
  )
});

export type ExchangeRateTypeType = z.infer<typeof exchangeRateTypeSchema>;

export const exchangeRateTypeFormSchema = object({
  name: string(),
  description: string().optional(),
  source: exchangeRateSourceEnum,
  provider: string().optional(),
  updateEvery: coerce.number<number>().optional(),
});

export type ExchangeRateTypeFormType = z.infer<typeof exchangeRateTypeFormSchema>;

export const exchangeRateFormSchema = object({
  rate: coerce.number<number>(),
  date: date(),
  typeId: string(),
});

export type ExchangeRateFormType = z.infer<typeof exchangeRateFormSchema>;

export type FormExchangeRateTypeProps = {
  setOpenModalMenu?: Dispatch<SetStateAction<boolean>>;
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  exchangeRateType?: ExchangeRateTypeType;
};
