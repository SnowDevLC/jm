"use client";

import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

import {
  FormPricesListProps,
  pricesListFormSchema,
  PricesListFormType,
  FORM_MARGINS_TYPES_ITEMS,
} from "../lib/zodPricesLists";

import { createPricesList, updatePricesList } from "../actions/actionsPricesLists";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FormPricesList(props: FormPricesListProps) {
  const { setOpenModalMenu, setOpenModalForm, pricesList } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const form = useForm<PricesListFormType>({
    resolver: zodResolver(pricesListFormSchema),
    mode: "onChange",
    defaultValues: {
      name: pricesList?.name ?? "",
      description: pricesList?.description ?? "",
      marginType: pricesList?.marginType === "BASE" ? "PERCENTAGE" : (pricesList?.marginType ?? "PERCENTAGE"),
      marginValue: Number(pricesList?.marginValue ?? 0),
      marginRules:
        pricesList?.marginRules?.map((rule) => ({
          minBaseMargin: Number(rule.minBaseMargin),
          coefficient: Number(rule.coefficient),
        })) ?? [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isValid },
  } = form;

  const {
    fields: marginRules,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "marginRules",
  });

  const marginType = watch("marginType");

  useEffect(() => {
    reset({
      name: pricesList?.name ?? "",
      description: pricesList?.description ?? "",
      marginType: pricesList?.marginType === "BASE" ? "PERCENTAGE" : (pricesList?.marginType ?? "PERCENTAGE"),
      marginValue: Number(pricesList?.marginValue ?? 0),
      marginRules:
        pricesList?.marginRules?.map((rule) => ({
          minBaseMargin: Number(rule.minBaseMargin),
          coefficient: Number(rule.coefficient),
        })) ?? [],
    });
  }, [pricesList, reset]);

  const onSubmit = async (values: PricesListFormType) => {
    setIsSubmitting(true);

    try {
      if (pricesList?.isDefault || pricesList?.marginType === "BASE") {
        toast.add({
          type: "error",
          title: "Operación no permitida",
          description: "La lista base no se puede editar desde este formulario.",
          priority: "high",
        });
        return;
      }

      const payload: PricesListFormType = {
        ...values,
        marginValue: values.marginType === "DERIVED" ? 0 : values.marginValue,
        marginRules: values.marginType === "DERIVED" ? values.marginRules : [],
      };

      const result = pricesList ? await updatePricesList(pricesList.id, payload) : await createPricesList(payload);

      if (!result.success) {
        toast.add({
          type: "error",
          title: "Algo salió mal",
          description: "No se pudo guardar la lista. Intentá nuevamente.",
          priority: "high",
        });
        return;
      }

      toast.add({
        type: "success",
        title: pricesList ? "Lista de precios guardada" : "Lista de precios creada",
        description: "Los cambios se guardaron correctamente.",
      });

      setOpenConfirmation(false);
      reset();
      setOpenModalForm?.(false);
      setOpenModalMenu?.(false);
    } catch {
      toast.add({
        type: "error",
        title: "Error inesperado",
        description: "Ocurrió un error al guardar la lista.",
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          if (isValid) setOpenConfirmation(true);
        }}
      >
        <FieldGroup className="grid gap-4 md:grid-cols-2">
          {/* Nombre */}
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent className="flex flex-row justify-between">
                  <FieldLabel>Nombre</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Input placeholder="Ingrese nombre" type="text" {...field} />
              </Field>
            )}
          />

          {/* Descripción */}
          <Controller
            control={control}
            name="description"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent className="flex flex-row justify-between">
                  <FieldLabel>Descripción</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Input placeholder="Ingrese descripción" type="text" {...field} />
              </Field>
            )}
          />

          {/* Tipo de lista */}
          <Controller
            control={form.control}
            name="marginType"
            render={({ field, fieldState }) => (
              <Field>
                <FieldContent className="flex flex-row justify-between">
                  <FieldLabel>Tipo de cálculo</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>

                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                  items={FORM_MARGINS_TYPES_ITEMS}
                >
                  <SelectTrigger id="marginType" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Seleccionar tipo de cálculo" />
                  </SelectTrigger>

                  <SelectContent>
                    {FORM_MARGINS_TYPES_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          {/* Porcentaje o monto fijo */}
          {(marginType === "PERCENTAGE" || marginType === "FIXED") && (
            <Controller
              control={control}
              name="marginValue"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldContent className="flex flex-row justify-between">
                    <FieldLabel>
                      {marginType === "PERCENTAGE" ? "Porcentaje adicional" : "Monto fijo adicional"}
                    </FieldLabel>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </FieldContent>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step={marginType === "PERCENTAGE" ? "0.1" : "0.01"}
                      className="pr-10"
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? 0}
                      onChange={(event) =>
                        field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                      }
                    />
                    <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                      {marginType === "PERCENTAGE" ? "%" : "$"}
                    </span>
                  </div>
                </Field>
              )}
            />
          )}
        </FieldGroup>

        {/* Reglas para listas derivadas */}
        {marginType === "DERIVED" && (
          <section className="space-y-4 rounded-lg border p-4">
            <div>
              <h3 className="font-medium">Reglas de margen</h3>
              <p className="text-muted-foreground text-sm">
                Definí el margen mínimo de la lista base y el coeficiente porcentual que se aplicará a ese margen.
              </p>
            </div>

            {marginRules.map((rule, index) => (
              <div key={rule.id} className="grid items-start gap-3 md:grid-cols-[1fr_1fr_auto]">
                <Controller
                  control={control}
                  name={`marginRules.${index}.minBaseMargin`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldContent className="flex flex-row justify-between">
                        <FieldLabel>Margen base mínimo</FieldLabel>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </FieldContent>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          className="pr-8"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                          }
                        />
                        <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                          %
                        </span>
                      </div>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name={`marginRules.${index}.coefficient`}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldContent className="flex flex-row justify-between">
                        <FieldLabel>Coeficiente</FieldLabel>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                      </FieldContent>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          className="pr-8"
                          name={field.name}
                          ref={field.ref}
                          onBlur={field.onBlur}
                          value={field.value ?? ""}
                          onChange={(event) =>
                            field.onChange(event.target.value === "" ? undefined : Number(event.target.value))
                          }
                        />
                        <span className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                          %
                        </span>
                      </div>
                    </Field>
                  )}
                />

                <Button type="button" variant="outline" className="mt-7" onClick={() => remove(index)}>
                  Eliminar
                </Button>
              </div>
            ))}

            {typeof form.formState.errors.marginRules?.message === "string" && (
              <p className="text-destructive text-sm">{form.formState.errors.marginRules.message}</p>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                append({
                  minBaseMargin: 0,
                  coefficient: 80,
                })
              }
            >
              Agregar regla
            </Button>
          </section>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={!isValid || isSubmitting}>
            {pricesList ? "Guardar cambios" : "Crear lista"}
          </Button>
        </div>
      </form>

      {/* Confirmación */}
      <Dialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
        <DialogContent>
          <DialogTitle>{pricesList ? "Guardar lista" : "Crear lista"}</DialogTitle>
          <DialogDescription>
            ¿Confirmás {pricesList ? "los cambios de" : "la creación de"} la lista de precios?
          </DialogDescription>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => setOpenConfirmation(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!isValid || isSubmitting} onClick={handleSubmit(onSubmit)}>
              {isSubmitting ? "Guardando..." : pricesList ? "Confirmar cambios" : "Confirmar creación"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
