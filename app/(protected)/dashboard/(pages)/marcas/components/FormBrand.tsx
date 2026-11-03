"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { brandFormSchema, BrandFormType, FormBrandProps } from "../lib/zodBrands";
import { createBrand, updateBrand } from "../actions/actionsBrands";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function FormBrand(props: FormBrandProps) {
  const { setOpenModalMenu, setOpenModalForm, brand } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BrandFormType>({
    resolver: zodResolver(brandFormSchema),
    mode: "onChange",
    defaultValues: {
      name: brand?.name || "",
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  const onSubmit = async (values: BrandFormType) => {
    setIsSubmitting(true);
    if (brand) {
      await onSubmitUpdate(values);
    } else {
      const { success } = await createBrand(values);
      if (!success) {
        toast.add({
          type: "error",
          title: "Algo salió mal",
          description: "Intenta nuevamente más tarde.",
          priority: "high",
        });
        setIsSubmitting(false);
        return;
      }
      toast.add({
            type: "success",
            title: "Marca creada",
            description: "Ya se encuentra en el sistema.",
          })
      if (setOpenModalForm) {
        setOpenModalForm(false);
      }
    }
    setIsSubmitting(false);
  };

  const onSubmitUpdate = async (values: BrandFormType) => {
    if (!brand) {
      toast.add({
        type: "error",
        title: "Ninguna marca seleccionada",
        description: "Seleccione una marca para continuar.",
        priority: "high",
      });
      setIsSubmitting(false);
      return;
    }
    const brandId = brand.id;
    const { success } = await updateBrand(values, brandId);
    if (!success) {
      toast.add({
        type: "error",
        title: "Algo salió mal",
        description: "Intenta nuevamente más tarde.",
        priority: "high",
      });
      setIsSubmitting(false);
      return;
    }
    toast.add({
            type: "success",
            title: "Marca actualizada",
            description: "Ya se encuentra en el sistema.",
          })
    reset();
    if (setOpenModalForm && setOpenModalMenu) {
      setOpenModalForm(false);
      setOpenModalMenu(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <FieldGroup className="grid md:grid-cols-2 gap-3">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Nombre</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Nombre" type="text" {...field} />
            </Field>
          )}
        />
      </FieldGroup>
      <Dialog>
        <DialogTrigger>
          <Button type="button" disabled={!isValid}>
            {brand?.name ? "Guardar" : "Crear"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{brand?.name ? "Guardar" : "Crear"}</DialogTitle>
          <DialogDescription>Confirma {brand?.name ? "Guardar" : "Crear"} Marca</DialogDescription>
          <Button type="submit" disabled={!isValid || isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {brand?.name ? "Guardar" : "Crear"}
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
