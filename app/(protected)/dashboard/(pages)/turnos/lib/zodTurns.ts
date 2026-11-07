import { Dispatch, SetStateAction } from "react";
import { object, string, z, enum as enum_, array, date, number, boolean } from "zod";

export const turnStatusEnum = z.enum(["PENDIENTE", "TERMINADO", "CANCELADO"]);

export type TurnStatus = z.infer<typeof turnStatusEnum>;

export const TURN_CATEGORIES = [
  { label: "PPF", value: "PPF" },
  { label: "Polarizado", value: "POLARIZADO" },
  { label: "Tratamiento", value: "TRATAMIENTO" },
  { label: "Otros", value: "OTROS" },
] as const;

export const turnCategoryEnum = z.enum([
  "PPF",
  "POLARIZADO",
  "TRATAMIENTO",
  "OTROS",
]);

export const turnSchema = object({
  id: string(),
  startsAt: date(),
  endsAt: date(),
  status: turnStatusEnum,
  car: string(),
  description: string(),
  category: string(),
  client: object({
    id: string(),
    name: string(),
    phone: string(),
  }),
});
export type TurnType = z.infer<typeof turnSchema>;

export const turnFormSchema = object({
  startsAt: date(),
  endsAt: date(),
  status: turnStatusEnum,
  car: string().min(1, "Vehículo requerido"),
  description: string(),
  category: turnCategoryEnum,
  clientId: string().min(1, "Seleccione un cliente"),
}).refine((data) => data.endsAt > data.startsAt, {
  message: "La fecha de finalización debe ser posterior al inicio",
  path: ["endsAt"],
});
export type TurnFormType = z.infer<typeof turnFormSchema>;

export type FormTurnProps = {
  setOpenModalMenu?: Dispatch<SetStateAction<boolean>>;
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  turn?: TurnType;
  viewModifyButton?: boolean;
};

export const TURN_STATUS = {
  PENDIENTE: {
    label: "Pendiente",
    value: "PENDIENTE",
  },
  TERMINADO: {
    label: "Terminado",
    value: "TERMINADO",
  },
  CANCELADO: {
    label: "Cancelado",
    value: "CANCELADO",
  },
} satisfies Record<TurnStatus, { label: string; value: string }>;

export const TURN_STATUS_ITEMS = Object.values(TURN_STATUS);
