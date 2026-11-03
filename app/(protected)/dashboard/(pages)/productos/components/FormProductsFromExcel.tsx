"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormProductFromExcelProps, productFromExcelFormSchema, ProductFromExcelFormType } from "../lib/zodProducts";
import { refreshDataServer } from "../actions/actionsProducts";
import axios from "axios";
import { useState } from "react";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function FormProductsFromExcel(props: FormProductFromExcelProps) {
  const { setOpenModalForm, session } = props;
  const [loading, setLoading] = useState(false);

  const form = useForm<ProductFromExcelFormType>({
    resolver: zodResolver(productFromExcelFormSchema),
    mode: "onChange",
    defaultValues: {
      file: undefined,
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  async function onSubmit(values: ProductFromExcelFormType) {
    // const formData = new FormData();
    // if (values.file) {
    //   formData.append("file", values.file);
    //   formData.append("userId", session?.user.id || "");
    // }

    // try {
    //   setLoading(true);
    //   const response = await axios.post(`${API_URL}/products/upload-excel`, formData, {
    //     headers: {
    //       "Content-Type": "multipart/form-data",
    //     },
    //   });

    //   if (response.status === 201) {
    //     toast({
    //       title: "Productos cargados",
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
            <Dialog>
              <DialogTrigger
              redner={
                <Button type="button" disabled={!isValid}>
                Agregar Productos
                </Button>
                }
              />
              <DialogContent>
                <DialogTitle>Agregar Productos</DialogTitle>
                <DialogDescription>Confirma Agregar los Productos</DialogDescription>
                <Button type="submit" disabled={!isValid} onClick={form.handleSubmit(onSubmit)}>
                  Agregar
                </Button>
              </DialogContent>
            </Dialog>
          </form>
        </Form>
      )} */}
    </>
  );
}
