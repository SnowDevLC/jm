"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  ExchangeRateTypeType,
  IVA_CONDITIONS_ITEMS,
  systemSettingsFormSchema,
  SystemSettingsFormType,
  SystemSettingsType,
} from "../lib/zodConfig";
import { updateSystemSettings } from "../actions/actionsConfig";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, setDefaultOptions } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PricesListType } from "../../listas-precios/lib/zodPricesLists";
import { getPriceListByApi } from "../../listas-precios/lib/ApiPricesLists";
setDefaultOptions({ locale: es });

export default function FormSystemSettings({ systemSettings, exchangeRateType }: { systemSettings: SystemSettingsType | null, exchangeRateType: ExchangeRateTypeType[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModify, setIsModify] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [priceLists, setPriceLists] = useState<PricesListType[]>([]);

  const form = useForm<SystemSettingsFormType>({
    resolver: zodResolver(systemSettingsFormSchema),
    mode: "onChange",
    defaultValues: {
      name: systemSettings?.name || "",
      cuit: systemSettings?.cuit || "",
      address: systemSettings?.address || "",
      pointWebService: systemSettings?.pointWebService || 0,
      ivaCondition: systemSettings?.ivaCondition || "NC",
      startActivity: systemSettings ? new Date(systemSettings?.startActivity) : new Date(),
      priceRounding: systemSettings?.priceRounding || 0,
      marginDefault: systemSettings?.marginDefault || 0,
      exchangeRateTypeId: systemSettings?.exchangeRateType?.id || "",
      priceListTNId: systemSettings?.priceListTN?.id || "",
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  useEffect(() => {
    async function fetchData() {
      try {
        const priceListData = await getPriceListByApi();
        setPriceLists(priceListData);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    }
    fetchData();
  }, []);

  const onSubmitUpdate = async (values: SystemSettingsFormType) => {
    if (!systemSettings) return;

    setIsSubmitting(true);

    try {
      const { success } = await updateSystemSettings(values, systemSettings.id);

      if (!success) {
        toast.add({
          type: "error",
          title: "Algo salió mal",
          description: "Intenta nuevamente más tarde.",
          priority: "high",
        });
        return;
      }

      toast.add({
        type: "success",
        title: "Configuración actualizada",
        description: "Ya se encuentra en el sistema.",
      });

      setIsModify(false);
      setOpenModalUpdate(false);
    } catch (error) {
      console.error("Error actualizando configuración:", error);

      toast.add({
        type: "error",
        title: "Algo salió mal",
        description: "Intenta nuevamente más tarde.",
        priority: "high",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="system-settings-form" onSubmit={form.handleSubmit(onSubmitUpdate)} className="space-y-8">
      <FieldGroup className="grid md:grid-cols-2 gap-3">

        <h2 className="col-span-full">Datos del Sistema</h2>

        <Controller
          control={form.control}
          name="priceRounding"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Redondeo de Precios ($)</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Redondeo de Precio" type="text" {...field} disabled={!isModify} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="marginDefault"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Margen de Ganancia (%)</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Margen de Ganancia" type="text" {...field} disabled={!isModify} />
            </Field>
          )}
        />

        <Controller
          name="priceListTNId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel htmlFor="form-rhf-select-price-list-tn">Lista de Precio para TiendaNube</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                disabled={!isModify}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                items={priceLists.map((pl) => {
                  return {
                    label: pl.name,
                    value: pl.id,
                  };
                })}
              >
                <SelectTrigger
                  id="form-rhf-select-price-list-tn"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Seleccionar Lista de Precios" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger>
                  {priceLists.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          name="exchangeRateTypeId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel htmlFor="form-rhf-select-price-list-tn">Tipo de Cotización</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                disabled={!isModify}
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                items={exchangeRateType.map((er) => {
                  return {
                    label: er.name,
                    value: er.id,
                  };
                })}
              >
                <SelectTrigger
                  id="form-rhf-select-price-list-tn"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Seleccionar Lista de Precios" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger>
                  {exchangeRateType.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Separator className="col-span-full" />

        <h2 className="col-span-full">Datos Fiscales</h2>
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Razón Social</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Nombre" type="text" {...field} disabled={!isModify} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="cuit"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>CUIT</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese CUIT" type="text" {...field} disabled={!isModify} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="address"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Dirección</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Dirección" type="text" {...field} disabled={!isModify} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="pointWebService"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Punto de Venta (Facturación Electronica)</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Punto de Venta" type="text" {...field} disabled={!isModify} />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="ivaCondition"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Condición de IVA</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                items={IVA_CONDITIONS_ITEMS}
                disabled={!isModify}
              >
                <SelectTrigger
                  id="form-rhf-select-iva-condition"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Seleccionar Condición de IVA" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger>
                  {IVA_CONDITIONS_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="startActivity"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Inicio de Actividades</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant={"outline"}
                      className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      disabled={!isModify}
                    ></Button>
                  }
                >
                  {field.value ? format(field.value, "P") : <span>Seleccione Fecha</span>}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    locale={es}
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                  />
                </PopoverContent>
              </Popover>
            </Field>
          )}
        />

      

        
      </FieldGroup>
      <Dialog open={openModalUpdate} onOpenChange={setOpenModalUpdate}>
        <DialogTrigger
          render={
            <Button type="button" disabled={!isValid || !isModify}>
              Guardar
            </Button>
          }
        />
        <DialogContent>
          <DialogTitle>Guardar Cambios</DialogTitle>
          <DialogDescription>Confirma guardar los cambios</DialogDescription>
          <Button type="submit" disabled={!isValid || isSubmitting} form="system-settings-form">
            Guardar
          </Button>
        </DialogContent>
      </Dialog>
      <Button type="button" className="ml-2" onClick={() => setIsModify((prev) => !prev)}>
        {isModify ? "Cancelar" : "Modificar"}
      </Button>
    </form>
  );
}
