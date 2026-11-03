"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { exchangeRateTypeFormSchema, ExchangeRateTypeFormType, FormExchangeRateTypeProps } from "../lib/zodConfig";
import { createExchangeRateType, updateExchangeRateType } from "../actions/actionsConfig";

export default function FormExchangeRateType(props: FormExchangeRateTypeProps) {
  const { setOpenModalMenu, setOpenModalForm, exchangeRateType } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ExchangeRateTypeFormType>({
    resolver: zodResolver(exchangeRateTypeFormSchema),
    mode: "onChange",
    defaultValues: {
      name: exchangeRateType?.name || "",
      description: exchangeRateType?.description || "",
      source: exchangeRateType?.source || "MANUAL",
      provider: exchangeRateType?.provider || "",
      updateEvery: exchangeRateType?.updateEvery || 0,
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  const onSubmit = async (values: ExchangeRateTypeFormType) => {
    setIsSubmitting(true);
    if (exchangeRateType) {
      await onSubmitUpdate(values);
    } else {
      const { success } = await createExchangeRateType(values);
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
        title: "Tipo de Cotización creado",
        description: "Ya se encuentra en el sistema.",
      });
      if (setOpenModalForm) {
        setOpenModalForm(false);
      }
    }
    setIsSubmitting(false);
  };

  const onSubmitUpdate = async (values: ExchangeRateTypeFormType) => {
    if (!exchangeRateType) {
      toast.add({
        type: "error",
        title: "Ningun tipo de cotización seleccionado",
        description: "Seleccione un tipo de cotización para continuar.",
        priority: "high",
      });

      setIsSubmitting(false);
      return;
    }
    const exchangeRateTypeId = exchangeRateType.id;
    const { success } = await updateExchangeRateType(values, exchangeRateTypeId);
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
      title: "Tipo de cotización actualizado",
      description: "Ya se encuentra en el sistema.",
    });
    reset();
    if (setOpenModalForm && setOpenModalMenu) {
      setOpenModalForm(false);
      setOpenModalMenu(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border-t pt-2">
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

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Descripción</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Descripción" type="text" {...field} />
            </Field>
          )}
        />

        <Controller
          name="source"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Teléfono</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Teléfono" type="text" {...field} />
            </Field>
          )}
        />

        <Controller
          name="updateEvery"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Actualizar Cotización (días)</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese días" type="text" {...field} />
            </Field>
          )}
        />
      </FieldGroup>
      <Dialog>
        <DialogTrigger
          render={
            <Button type="button" disabled={!isValid}>
              {exchangeRateType?.name ? "Guardar" : "Crear"}
            </Button>
          }
        />
        <DialogContent>
          <DialogTitle>{exchangeRateType?.name ? "Guardar" : "Crear"}</DialogTitle>
          <DialogDescription>
            Confirma {exchangeRateType?.name ? "Guardar" : "Crear"} Tipo de Cotización
          </DialogDescription>
          <Button type="submit" disabled={!isValid || isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {exchangeRateType?.name ? "Guardar" : "Crear"}
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
