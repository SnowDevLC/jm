"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { depositFormSchema, DepositFormType, FormDepositProps } from "../lib/zodDeposits";
import { toast } from "@/components/ui/toast";
import { createDeposit, updateDeposit } from "../actions/actionsDeposits";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function FormDeposit(props: FormDepositProps) {
  const { setOpenModalMenu, setOpenModalForm, deposit, viewModifyButton = false } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModify, setIsModify] = useState(false);

  const form = useForm<DepositFormType>({
    resolver: zodResolver(depositFormSchema),
    mode: "onChange",
    defaultValues: {
      name: deposit?.name || "",
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  async function onSubmit(values: DepositFormType) {
    setIsSubmitting(true);
    if (deposit) {
      await onSubmitUpdate(values);
    } else {
      const { success } = await createDeposit(values);
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
            title: "Producto creado",
            description: "Ya se encuentra en el sistema.",
          })
      if (setOpenModalForm) {
        setOpenModalForm(false);
      }
    }
    setIsSubmitting(false);
  }

  const onSubmitUpdate = async (values: DepositFormType) => {
    if (!deposit) {
      toast.add({
        type: "error",
        title: "Ningun depósito seleccionado",
        description: "Seleccione un depósito para continuar.",
        priority: "high",
      });
      setIsSubmitting(false);
      return;
    }
    const depositId = deposit.id;
    const { success } = await updateDeposit(values, depositId);
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
            title: "Depósito actualizado",
            description: "Ya se encuentra en el sistema.",
          })
    // if (pathname === `/dashboard/deposits/${depositId}`) {
    //   window.location.reload();
    //   return;
    // }
    reset();
    if (setOpenModalForm && setOpenModalMenu) {
      setOpenModalForm(false);
      setOpenModalMenu(false);
    }
    window.location.reload();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 border-t pt-2">
      <FieldGroup className="grid md:grid-cols-2 gap-3">
        <Controller
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Nombre</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input placeholder="Ingrese Nombre" type="text" {...field} disabled={viewModifyButton && !isModify} />
            </Field>
          )}
        />
      </FieldGroup>
      <Dialog>
        <DialogTrigger>
          <Button type="button" disabled={!isValid || (!isModify && viewModifyButton)}>
            {deposit?.name ? "Guardar" : "Crear"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>{deposit?.name ? "Guardar" : "Crear"}</DialogTitle>
          <DialogDescription>Confirma {deposit?.name ? "Guardar" : "Crear"} Depósito</DialogDescription>
          <Button type="submit" disabled={!isValid || isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {deposit?.name ? "Guardar" : "Crear"}
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
