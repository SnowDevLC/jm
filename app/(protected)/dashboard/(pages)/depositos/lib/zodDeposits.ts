import { Dispatch, SetStateAction } from "react";
import { array, boolean, date, number, object, string, z } from "zod";

export const depositSchema = object({
  id: string(),
  name: string(),
  stock: array(
    object({
      productId: string(),
      quantity: number(),
      product: object({
        name: string(),
        brand: object({
          name: string(),
        }),
        cost: number(),
        price: number(),
        SKU: string(),
        barcode: string(),
        discount: boolean(),
        isActiveShop: boolean(),
      }),
    })
  ),
  stockMovements: array(
    object({
      date: date(),
      type: string(),
      relatedDeposit: string(),
      products: array(
        object({
          quantity: number(),
          product: object({
            name: string(),
            SKU: string(),
          })
        })
      )
    }) 
  ),
});
export type DepositType = z.infer<typeof depositSchema>;

export const depositFormSchema = object({
  name: string("Nombre requirido").min(1, "Nombre requerido"),
  address: string("Nombre requirido").optional(),
});
export type DepositFormType = z.infer<typeof depositFormSchema>;

export type FormDepositProps = {
  setOpenModalMenu?: Dispatch<SetStateAction<boolean>>;
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  deposit?: DepositType;
  viewModifyButton?: boolean;
};

export type FormMoveStockProps = {
  setOpenModalForm?: Dispatch<SetStateAction<boolean>>;
  deposit?: DepositType;
};
