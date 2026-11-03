"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  FormProductFromExcelProps,
  ProductFromExcelFormType,
  productUpdateFromExcelFormSchema,
  ProductUpdateFromExcelFormType,
} from "../lib/zodProducts";
import { refreshDataServer } from "../actions/actionsProducts";
import axios from "axios";
import { useState } from "react";
// import { Loader } from "@/components";
// import { Switch } from "@/components/ui/switch";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function FormProductsUpdateFromExcel(props: FormProductFromExcelProps) {
  const { setOpenModalForm, session } = props;
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductUpdateFromExcelFormType>({
    resolver: zodResolver(productUpdateFromExcelFormSchema),
    mode: "onChange",
    defaultValues: {
      file: undefined,
      add: true,
      price: true,
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  async function onSubmit(values: ProductUpdateFromExcelFormType) {
    // const formData = new FormData();
    // if (values.file) {
    //   formData.append("file", values.file);
    //   formData.append("userId", session?.user.id || "");
    //   if (values.add) {
    //     formData.append("add", "true");
    //   } else {
    //     formData.append("add", "false");
    //   }
    //   if (values.price) {
    //     formData.append("price", "true");
    //   } else {
    //     formData.append("price", "false");
    //   }
    // }

    // try {
    //   setLoading(true);
    //   const response = await axios.post(`${API_URL}/products/update-excel`, formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   });

    //   if (response.status === 201) {
    //     toast({
    //       title: "Productos actualizados",
    //     });
    //     await refreshDataServer();
    //     if (setOpenModalForm) {
    //       setOpenModalForm(false);
    //     }
    //     reset();
    //     return;
    //   }
    // } catch (error) {
    //   toast({
    //     title: "Algo salió mal",
    //     variant: "destructive",
    //   });
    // } finally {
    //   setLoading(false);
    // }
  }

  return (
    <>
      {/* {loading ? (
        <Loader />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" encType="multipart/form-data">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Archivo Excel</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="add"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-center rounded-lg border p-4">
                  <FormControl>
                    <div className="flex items-center justify-center gap-2">
                      <p>SETEAR STOCK</p>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                      <p>SUMAR STOCK</p>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-center rounded-lg border p-4">
                  <FormControl>
                    <div className="flex items-center justify-center gap-2">
                      <p>MANTENER COSTO Y PRECIOS</p>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                      <p>MODIFICAR COSTO Y PRECIOS</p>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <Dialog>
              <DialogTrigger
              render={
                <Button type="button" disabled={!isValid}>
                Actualizar Productos
                </Button>
                }
              />
              <DialogContent>
                <DialogTitle>Actualizar Productos</DialogTitle>
                <DialogDescription>Confirma Actualizar los Productos</DialogDescription>
                <Button type="submit" disabled={!isValid} onClick={form.handleSubmit(onSubmit)}>
                  Actualizar
                </Button>
              </DialogContent>
            </Dialog>
          </form>
        </Form>
      )} */}
    </>
  );
}
