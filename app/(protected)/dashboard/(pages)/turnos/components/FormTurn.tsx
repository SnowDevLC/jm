"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormTurnProps, TURN_CATEGORIES, turnFormSchema, TurnFormType } from "../lib/zodTurns";
import { ClientType } from "../../clientes/lib/zodClients";
import { DateTimePicker } from "./CalendarDayPicker";
import { Textarea } from "@/components/ui/textarea";
import { createTurn } from "../actions/actionsTurns";
import { CirclePlus } from "lucide-react";
import FormClient from "../../clientes/components/FormClient";
import { useRouter } from "next/navigation";

export default function FormTurn(props: FormTurnProps) {
  const { setOpenModalMenu, setOpenModalForm, turn, viewModifyButton = false } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModify, setIsModify] = useState(false);
  const [clients, setClients] = useState<ClientType[]>([]);
  const [openModalCreateClient, setOpenModalCreateClient] = useState(false);
  const router = useRouter();

  const now = new Date();
  const end = new Date(now);
  end.setHours(end.getHours() + 1);

  const form = useForm<TurnFormType>({
    resolver: zodResolver(turnFormSchema),
    mode: "onChange",
    defaultValues: {
      startsAt: now,
      endsAt: end,
      status: "PENDIENTE",
      car: "",
      description: "",
      category: "PPF",
      clientId: "",
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  const fetchClients = async (clientId?: string) => {
    try {
      const response = await fetch("/api/clients", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("No se pudieron obtener los clientes");
      }

      const clientsApi: ClientType[] = await response.json();

      setClients(clientsApi);

      if (clientId) {
        const exists = clientsApi.some((client) => client.id === clientId);

        if (exists) {
          form.setValue("clientId", clientId, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    } catch (error) {
      console.error("Error obteniendo clientes:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const onSubmit = async (values: TurnFormType) => {
    setIsSubmitting(true);
    const { success } = await createTurn(values);
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
      title: "Turno agendado",
      description: "Ya se encuentra en el sistema.",
    });
    router.refresh();
    if (setOpenModalForm) {
      setOpenModalForm(false);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border-t pt-2">
      <FieldGroup className="grid md:grid-cols-2 gap-3">
        <Controller
          name="clientId"
          control={form.control}
          render={({ field, fieldState }) => {
            console.log("Valor recibido por Select:", field.value);

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-rhf-select-client">Cliente</FieldLabel>

                <Select
                  key={clients.length}
                  name={field.name}
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    console.log("Select onValueChange:", value);
                    field.onChange(value);
                  }}
                  items={clients.map((client) => ({
                    label: client.name,
                    value: client.id,
                  }))}
                >
                  <SelectTrigger id="form-rhf-select-client" aria-invalid={fieldState.invalid} className="min-w-30">
                    <SelectValue placeholder="Seleccionar Cliente" />
                  </SelectTrigger>

                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            );
          }}
        />

        <Controller
          name="car"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Vehículo</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Vehículo" type="text" {...field} disabled={viewModifyButton && !isModify} />
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
              <Textarea placeholder="Ingrese Descripción" {...field} disabled={viewModifyButton && !isModify} />
            </Field>
          )}
        />

        <Controller
          name="category"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Categoría</FieldLabel>

              <Select
                value={field.value}
                onValueChange={field.onChange}
                items={TURN_CATEGORIES.map((item) => ({
                  label: item.label,
                  value: item.value,
                }))}
              >
                <SelectTrigger aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>

                <SelectContent>
                  {TURN_CATEGORIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="startsAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Fecha y hora de inicio</FieldLabel>

              <DateTimePicker value={field.value} onChange={field.onChange} placeholder="Seleccionar inicio" />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="endsAt"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Fecha y hora de finalización</FieldLabel>

              <DateTimePicker value={field.value} onChange={field.onChange} placeholder="Seleccionar finalización" />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="flex justify-between">
        <Dialog>
          <DialogTrigger
            render={
              <Button type="button" disabled={!isValid || (!isModify && viewModifyButton)}>
                {turn?.car ? "Guardar" : "Crear"}
              </Button>
            }
          />
          <DialogContent>
            <DialogTitle>{turn?.car ? "Guardar" : "Crear"}</DialogTitle>
            <DialogDescription>Confirma {turn?.car ? "Guardar" : "Crear"} el Turno</DialogDescription>
            <Button type="submit" disabled={!isValid || isSubmitting} onClick={form.handleSubmit(onSubmit)}>
              {turn?.car ? "Guardar" : "Crear"}
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog open={openModalCreateClient} onOpenChange={setOpenModalCreateClient}>
          <DialogTrigger
            render={
              <Button type="button" className="gap-x-2">
                <CirclePlus />
                Crear Cliente
              </Button>
            }
          />
          <DialogContent className="sm:max-w-156">
            <DialogHeader>
              <DialogTitle>Crear Cliente</DialogTitle>
              <DialogDescription>Crear y Editar Cliente</DialogDescription>
            </DialogHeader>

            <FormClient setOpenModalForm={setOpenModalCreateClient} onClientCreated={fetchClients} />
          </DialogContent>
        </Dialog>
      </div>
      {viewModifyButton && (
        <Button type="button" className="ml-2" onClick={() => setIsModify((prev) => !prev)}>
          {isModify ? "Cancelar" : "Modificar"}
        </Button>
      )}
    </form>
  );
}
