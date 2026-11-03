import { Dispatch, SetStateAction } from "react";
import { object, string, z } from "zod";

export const categorySchema = object({
  id: string(),
  name: string(),
  parentId: string().nullable(),
});
export type CategoryType = z.infer<typeof categorySchema>;

export const categoryFormSchema = object({
  name: string("Nombre requirido").min(1, "Nombre requerido"),
  parentId: string().optional().nullable(),
});
export type CategoryFormType = z.infer<typeof categoryFormSchema>;

export type FormCategoryProps = {
  setOpenModalMenu?: Dispatch<SetStateAction<boolean>>;
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  category?: CategoryType;
  categories?: CategoryType[];
};

export type ListCategoriesProps = {
  categories: CategoryType[];
};
