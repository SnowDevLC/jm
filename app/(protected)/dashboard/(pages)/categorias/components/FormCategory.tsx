"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { categoryFormSchema, CategoryFormType, CategoryType, FormCategoryProps } from "../lib/zodCategories";
import { createCategory, updateCategory } from "../actions/actionsCategories";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { getCategoriesByApi } from "../lib/ApiCategories";

export default function FormCategory(props: FormCategoryProps) {
  const { setOpenModalMenu, setOpenModalForm, category } = props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCategoriesForm, setOpenCategoriesForm] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>(props.categories ?? []);

  const form = useForm<CategoryFormType>({
    resolver: zodResolver(categoryFormSchema),
    mode: "onChange",
    defaultValues: {
      name: category?.name || "",
      parentId: category?.parentId || null,
    },
  });
  const { isValid } = form.formState;
  const { reset } = form;

  useEffect(() => {
    if (!props.categories) {
      const fetchCategories = async () => {
        const data = await getCategoriesByApi();
        setCategories(data);
      };
      fetchCategories();
    }
  }, []);

  const onSubmit = async (values: CategoryFormType) => {
    setIsSubmitting(true);
    if (category) {
      await onSubmitUpdate(values);
    } else {
      const { success } = await createCategory(values);
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
        title: "Categoria creada",
        description: "Ya se encuentra en el sistema.",
      });
      if (setOpenModalForm) {
        setOpenModalForm(false);
      }
    }
    setIsSubmitting(false);
  };

  const onSubmitUpdate = async (values: CategoryFormType) => {
    if (!category) {
      toast.add({
        type: "error",
        title: "Ninguna categoria seleccionada",
        description: "Seleccione una categoria para continuar.",
        priority: "high",
      });
      setIsSubmitting(false);
      return;
    }
    const categoryId = category.id;
    const { success } = await updateCategory(values, categoryId);
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
      title: "Categoria guardada",
      description: "Ya se encuentra en el sistema.",
    });
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
        <Controller
          control={form.control}
          name="parentId"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Categoria Padre (opcional)</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Popover open={openCategoriesForm} onOpenChange={setOpenCategoriesForm}>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                    >
                      {field.value
                        ? categories.find((category) => category.id === field.value)?.name
                        : "Sin categoría padre"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  }
                />
                <PopoverContent className="w-75 p-0">
                  <Command>
                    <CommandInput placeholder="Buscar categoría..." />
                    <CommandList>
                      <CommandEmpty>Categoría no encontrado.</CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            value={category.name}
                            key={category.name}
                            onSelect={() => {
                              form.setValue("parentId", category.id, {
                                shouldValidate: true,
                                shouldDirty: true,
                                shouldTouch: true,
                              });
                              setOpenCategoriesForm(false);
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4", category.id === field.value ? "opacity-100" : "opacity-0")}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </Field>
          )}
        />
      </FieldGroup>
      <Dialog>
        <DialogTrigger
          render={
            <Button type="button" disabled={!isValid}>
              {category?.name ? "Guardar" : "Crear"}
            </Button>
          }
        />
        <DialogContent>
          <DialogTitle>{category?.name ? "Guardar" : "Crear"}</DialogTitle>
          <DialogDescription>Confirma {category?.name ? "Guardar" : "Crear"} Categoria</DialogDescription>
          <Button type="submit" disabled={!isValid || isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {category?.name ? "Guardar" : "Crear"}
          </Button>
        </DialogContent>
      </Dialog>
    </form>
  );
}
