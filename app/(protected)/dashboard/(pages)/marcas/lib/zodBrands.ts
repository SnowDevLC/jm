import { Dispatch, SetStateAction } from "react";
import { object, string, z } from "zod";

export const brandSchema = object({
  id: string(),
  name: string(),
});
export type BrandType = z.infer<typeof brandSchema>;

export const brandFormSchema = object({
  name: string("Nombre requirido").min(1, "Nombre requerido"),
});
export type BrandFormType = z.infer<typeof brandFormSchema>;

export type FormBrandProps = {
  setOpenModalMenu?: Dispatch<SetStateAction<boolean>>;
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  brand?: BrandType;
};

export type ListCategoriesProps = {
  brands: BrandType[];
};
