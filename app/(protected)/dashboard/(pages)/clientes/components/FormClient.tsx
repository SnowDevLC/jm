"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ClientFormType, clientFormSchema, FormClientProps, IVA_CONDITIONS_CLIENT_ITEMS } from "../lib/zodClients";
import { toast } from "@/components/ui/toast";
import { createClient, updateClient } from "../actions/actionsClients";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PricesListType } from "../../listas-precios/lib/zodPricesLists";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function FormClient(props: FormClientProps) {
  const { setOpenModalMenu, setOpenModalForm, client, viewModifyButton = false } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModify, setIsModify] = useState(false);
  const [priceLists, setPriceLists] = useState<PricesListType[]>([]);

  const form = useForm<ClientFormType>({
    resolver: zodResolver(clientFormSchema),
    mode: "onChange",
    defaultValues: {
      name: client?.name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      cuit: client?.cuit || "",
      companyName: client?.companyName || "",
      IVAcategory: client?.IVAcategory || "SIN_CATEGORIA",
      priceListId: client?.priceList.id || "",
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await fetch("/api/price-list");

        if (!response.ok) {
          throw new Error("No se pudo obtener las listas de precios");
        }

        const priceListsApi: PricesListType[] = await response.json();

        setPriceLists(priceListsApi);

        form.reset({
          name: client?.name || "",
          email: client?.email || "",
          phone: client?.phone || "",
          address: client?.address || "",
          cuit: client?.cuit || "",
          companyName: client?.companyName || "",
          IVAcategory: client?.IVAcategory || "SIN_CATEGORIA",
          priceListId: client?.priceList?.id ?? priceListsApi.find((pl) => pl.isDefault)?.id ?? "",
        });
      } catch (error) {
        console.error("Error obteniendo settings:", error);
      }
    }

    fetchSettings();
  }, [client, form, reset]);

  const onSubmit = async (values: ClientFormType) => {
    setIsSubmitting(true);
    if (client) {
      await onSubmitUpdate(values);
    } else {
      const { success } = await createClient(values);
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
        title: "Cliente creado",
        description: "Ya se encuentra en el sistema.",
      });
      if (setOpenModalForm) {
        setOpenModalForm(false);
      }
    }
    setIsSubmitting(false);
  };

  const onSubmitUpdate = async (values: ClientFormType) => {
    if (!client) {
      toast.add({
        type: "error",
        title: "Ningun cliente seleccionado",
        description: "Seleccione un cliente para continuar.",
        priority: "high",
      });

      setIsSubmitting(false);
      return;
    }
    const clientId = client.id;
    const { success } = await updateClient(values, clientId);
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
      title: "Cliente actualizado",
      description: "Ya se encuentra en el sistema.",
    });
    reset();
    if (setOpenModalForm && setOpenModalMenu) {
      setOpenModalForm(false);
      setOpenModalMenu(false);
    }
    if (viewModifyButton) {
      window.location.reload();
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
              <Input placeholder="Ingrese Nombre" type="text" {...field} disabled={viewModifyButton && !isModify} />
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Email</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Email" type="text" {...field} disabled={viewModifyButton && !isModify} />
            </Field>
          )}
        />

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Teléfono</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Teléfono" type="text" {...field} disabled={viewModifyButton && !isModify} />
            </Field>
          )}
        />

        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Dirección</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Dirección" type="text" {...field} disabled={viewModifyButton && !isModify} />
            </Field>
          )}
        />

        <Controller
          name="cuit"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>CUIT</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese CUIT" type="text" {...field} disabled={viewModifyButton && !isModify} />
            </Field>
          )}
        />

        <Controller
          name="companyName"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Razón Social</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                placeholder="Ingrese Razón Social"
                type="text"
                {...field}
                disabled={viewModifyButton && !isModify}
              />
            </Field>
          )}
        />
        <Controller
          name="IVAcategory"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel htmlFor="form-rhf-select-iva-condition">Condición de IVA</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                items={IVA_CONDITIONS_CLIENT_ITEMS}
              >
                <SelectTrigger
                  id="form-rhf-select-iva-condition"
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger>
                  {IVA_CONDITIONS_CLIENT_ITEMS.map((item) => (
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
          name="priceListId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel htmlFor="form-rhf-select-price-list">Lista de Precio</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
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
                  id="form-rhf-select-price-list"
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
      
      </FieldGroup>
      <Dialog>
        <DialogTrigger
          render={
            <Button type="button" disabled={!isValid || (!isModify && viewModifyButton)}>
              {client?.name ? "Guardar" : "Crear"}
            </Button>
          }
        />
        <DialogContent>
          <DialogTitle>{client?.name ? "Guardar" : "Crear"}</DialogTitle>
          <DialogDescription>Confirma {client?.name ? "Guardar" : "Crear"} Cliente</DialogDescription>
          <Button type="submit" disabled={!isValid || isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {client?.name ? "Guardar" : "Crear"}
          </Button>
        </DialogContent>
      </Dialog>
      {viewModifyButton && (
        <Button type="button" className="ml-2" onClick={() => setIsModify((prev) => !prev)}>
          {isModify ? "Cancelar" : "Modificar"}
        </Button>
      )}
    </form>
  );
}
