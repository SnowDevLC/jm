"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COST_REF_CURRENCY_ITEMS, FormProductProps, productFormSchema, ProductFormType } from "../lib/zodProducts";
import { DepositType } from "../../depositos/lib/zodDeposits";
// import { getDepositsByApi } from "../../depositos/lib/dataDeposits";
import { toast } from "@/components/ui/toast";
import { createProduct, updateProduct } from "../actions/actionsProducts";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Switch } from "@/components/ui/switch";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWatch } from "react-hook-form";
import { CategoryType } from "../../categorias/lib/zodCategories";
import { BrandType } from "../../marcas/lib/zodBrands";
import { getCategoriesByApi } from "../../categorias/lib/ApiCategories";
import { getBrandsByApi } from "../../marcas/lib/ApiBrands";
import { getDepositsByApi } from "../../depositos/lib/ApiDeposits";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import React from "react";
import { SupplierType } from "../../proveedores/lib/zodSuppliers";
import { getSuppliersByApi } from "../../proveedores/lib/ApiSuppliers";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FormProducts(props: FormProductProps) {
  const { setOpenModalMenu, setOpenModalForm, product, session, viewModifyButton = false } = props;
  const [deposits, setDeposits] = useState<DepositType[] | undefined>(props.deposits);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [brands, setBrands] = useState<BrandType[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openBrandsForm, setOpenBrandsForm] = useState(false);
  const [isModify, setIsModify] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  const [basePrice, setBasePrice] = useState(0);
  const [currentRate, setCurrentRate] = useState(0);
  const [priceRounding, setPriceRounding] = useState(0);
  const lastPriceInputsRef = useRef<string | null>(null);
  const manualPriceChangeRef = useRef(false);

  const defaultStock =
    deposits?.map((deposit) => ({
      depositId: deposit.id,
      depositName: deposit.name,
      quantity: 0,
    })) || [];

  const form = useForm<ProductFormType>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: {
      name: product?.name || "",
      brandId: product?.brand.id || "",
      cost: product?.cost || 0,
      costUSD: product?.costUSD || 0,
      costBonus: product?.costBonus || 0,
      costLogistics: product?.costLogistics || 0,
      costDate: product?.costDate || new Date(),
      ivaIncluded: product?.ivaIncluded || 0,
      ivaApplied: product?.ivaApplied || 0,
      marginDefault: 0,
      stock: defaultStock,
      discount: product?.discount || false,
      isActive: product?.isActive ?? true,
      isActiveShop: product?.isActiveShop || false,
      barcode: product?.barcode || "",
      updateBy: session.user.id || "",
      categories: [],
      costReferenceCurrency: product?.costReferenceCurrency || "ARG",
    },
  });

  useEffect(() => {
    console.log("FORM VALID:", form.formState.isValid);
    console.log("FORM ERRORS:", form.formState.errors);
    console.log("FORM VALUES:", form.getValues());
  }, [form.formState.isValid, form.formState.errors]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [categoriesData, brandsData] = await Promise.all([getCategoriesByApi(), getBrandsByApi()]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchDeposits = async () => {
      if (!deposits) {
        const data = await getDepositsByApi();
        setDeposits(data);
      }
    };
    fetchDeposits();
  }, [deposits]);

  useEffect(() => {
    if (!product || !deposits) return;

    const updatedStock = product.stock.map((stockItem) => ({
      depositId: stockItem.deposit.id,
      depositName: deposits.find((deposit) => deposit.id === stockItem.deposit.id)?.name || "",
      quantity: stockItem.quantity,
    }));

    const mappedCategories = product.categories?.map((pc) => ({
      categoryId: pc.id,
      name: pc.name,
    }));

    const basePriceList = product.priceLists.find((item) => item.priceList.isDefault);
    const savedMargin = Number(basePriceList?.marginValue ?? 0);

    form.reset({
      name: product.name,
      brandId: product.brand.id,
      cost: Number(product.cost),
      costUSD: Number(product.costUSD),
      costBonus: Number(product.costBonus),
      costLogistics: Number(product.costLogistics),
      costDate: product.costDate ? new Date(product.costDate) : new Date(),
      ivaIncluded: Number(product.ivaIncluded),
      ivaApplied: Number(product.ivaApplied),
      marginDefault: savedMargin,
      stock: updatedStock,
      discount: product.discount,
      isActive: product.isActive,
      isActiveShop: product.isActiveShop,
      barcode: product.barcode || "",
      updateBy: session.user.id || "",
      costReferenceCurrency: product.costReferenceCurrency,
      categories: mappedCategories ?? [],
    });

    setBasePrice(Number(basePriceList?.price ?? 0));

    // Evita recalcular y pisar el precio persistido al abrir el formulario.
    lastPriceInputsRef.current = JSON.stringify({
      cost: Number(product.cost),
      costUSD: Number(product.costUSD),
      costBonus: Number(product.costBonus),
      costLogistics: Number(product.costLogistics),
      ivaIncluded: Number(product.ivaIncluded),
      ivaApplied: Number(product.ivaApplied),
      marginDefault: savedMargin,
      costReferenceCurrency: product.costReferenceCurrency,
    });
  }, [product, deposits, session.user.id]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) throw new Error("No se pudo obtener la configuración");
        const settings = await response.json();
        if (cancelled) return;

        setCurrentRate(Number(settings.currentRate) || 0);
        setPriceRounding(Number(settings.priceRounding) || 0);

        // Para crear, usar el margen predeterminado de configuración si la API lo devuelve.
        if (!product && settings.marginDefault !== undefined) {
          form.setValue("marginDefault", Number(settings.marginDefault) || 0, {
            shouldDirty: false,
          });
        }
      } catch (error) {
        console.error("Error obteniendo settings:", error);
      }
    }

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, [product, form]);

  const { isValid } = form.formState;
  const { reset, setValue, getValues } = form;

  const cost = useWatch({ control: form.control, name: "cost" });
  const costUSD = useWatch({ control: form.control, name: "costUSD" });
  const costBonus = useWatch({ control: form.control, name: "costBonus" });
  const costLogistics = useWatch({ control: form.control, name: "costLogistics" });
  const ivaIncluded = useWatch({ control: form.control, name: "ivaIncluded" });
  const ivaApplied = useWatch({ control: form.control, name: "ivaApplied" });
  const marginDefault = useWatch({ control: form.control, name: "marginDefault" });
  const costReferenceCurrency = useWatch({ control: form.control, name: "costReferenceCurrency" });

  const safeNumber = (value: unknown) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const grossCost =
    costReferenceCurrency === "USD"
      ? safeNumber(costUSD) * currentRate
      : costReferenceCurrency === "BOTH"
        ? Math.max(safeNumber(cost), safeNumber(costUSD) * currentRate)
        : safeNumber(cost);

  const smartCost =
    grossCost *
    (1 - safeNumber(costBonus) / 100) *
    (1 + safeNumber(costLogistics) / 100) *
    (1 + safeNumber(ivaApplied) / 100 - safeNumber(ivaIncluded) / 100);

  const calculateBasePrice = (margin: number) => {
    const rawPrice = smartCost * (1 + margin / 100);
    if (!Number.isFinite(rawPrice)) return 0;
    return priceRounding > 0 ? Math.ceil(rawPrice / priceRounding) * priceRounding : Math.round(rawPrice * 100) / 100;
  };

  // La primera carga conserva el precio guardado. Luego recalcula si cambia costo/margen.
  useEffect(() => {
    const currentInputs = JSON.stringify({
      cost: safeNumber(cost),
      costUSD: safeNumber(costUSD),
      costBonus: safeNumber(costBonus),
      costLogistics: safeNumber(costLogistics),
      ivaIncluded: safeNumber(ivaIncluded),
      ivaApplied: safeNumber(ivaApplied),
      marginDefault: safeNumber(marginDefault),
      costReferenceCurrency,
    });

    if (lastPriceInputsRef.current === null) {
      lastPriceInputsRef.current = currentInputs;
      if (!product) setBasePrice(calculateBasePrice(safeNumber(marginDefault)));
      return;
    }

    if (lastPriceInputsRef.current === currentInputs) {
      if (!product) setBasePrice(calculateBasePrice(safeNumber(marginDefault)));
      return;
    }
    lastPriceInputsRef.current = currentInputs;
    if (manualPriceChangeRef.current) {
      manualPriceChangeRef.current = false;
      return;
    }
    setBasePrice(calculateBasePrice(safeNumber(marginDefault)));
  }, [
    cost,
    costUSD,
    costBonus,
    costLogistics,
    ivaIncluded,
    ivaApplied,
    marginDefault,
    costReferenceCurrency,
    currentRate,
    priceRounding,
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(value);
  };

  async function onSubmit(values: ProductFormType) {
    setIsSubmitting(true);
    if (product) {
      await onSubmitUpdate(values);
    } else {
      const { success } = await createProduct(values);
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
      });
      if (setOpenModalForm) {
        setOpenModalForm(false);
      }
    }
    setIsSubmitting(false);
  }

  const onSubmitUpdate = async (values: ProductFormType) => {
    if (!product) {
      toast.add({
        type: "error",
        title: "Ninguna producto seleccionado",
        description: "Seleccione un producto para continuar.",
        priority: "high",
      });
      setIsSubmitting(false);
      return;
    }
    const productId = product.id;
    const { success } = await updateProduct(values, productId);
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
      title: "Producto actualizado",
      description: "Ya se encuentra en el sistema.",
    });
    if (setOpenModalForm && setOpenModalMenu) {
      setOpenModalForm(false);
      setOpenModalMenu(false);
    }
    if (pathname === `/dashboard/products/${productId}`) {
      window.location.reload();
      return;
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <Controller
          control={form.control}
          name="barcode"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Código de Barras</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                placeholder="Ingrese Código de Barras"
                type="text"
                {...field}
                disabled={viewModifyButton && !isModify}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="categories"
          render={({ field, fieldState }) => {
            const anchor = useComboboxAnchor();

            const selectedIds = (field.value ?? []).map((category) => category.categoryId);

            return (
              <Field className="col-span-2">
                <FieldContent className="flex flex-row justify-between">
                  <FieldLabel>Categorías</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>

                <Combobox
                  multiple
                  autoHighlight
                  items={categories.map((category) => category.id)}
                  value={selectedIds}
                  onValueChange={(ids) => {
                    field.onChange(
                      ids.map((id) => {
                        const category = categories.find((item) => item.id === id);

                        return {
                          categoryId: id,
                          name: category?.name ?? "",
                        };
                      }),
                    );
                  }}
                >
                  <ComboboxChips ref={anchor} className="w-full">
                    <ComboboxValue>
                      {(values) => (
                        <React.Fragment>
                          {values.map((id: string) => {
                            const category = categories.find((item) => item.id === id);

                            return <ComboboxChip key={id}>{category?.name ?? id}</ComboboxChip>;
                          })}

                          <ComboboxChipsInput
                            placeholder="Seleccionar categorías..."
                            disabled={viewModifyButton && !isModify}
                          />
                        </React.Fragment>
                      )}
                    </ComboboxValue>
                  </ComboboxChips>

                  <ComboboxContent anchor={anchor}>
                    <ComboboxEmpty>No se encontraron categorías.</ComboboxEmpty>

                    <ComboboxList>
                      {(id) => {
                        const category = categories.find((item) => item.id === id);

                        return (
                          <ComboboxItem
                            key={id}
                            value={id}
                            className="cursor-pointer hover:bg-accent data-highlighted:bg-accent"
                          >
                            {category?.name ?? id}
                          </ComboboxItem>
                        );
                      }}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
            );
          }}
        />

        <Controller
          control={form.control}
          name="brandId"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Marca</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>

              <Combobox items={brands} value={field.value} onValueChange={(value) => field.onChange(value)}>
                <ComboboxInput
                  placeholder="Seleccione marca"
                  value={brands.find((brand) => brand.id === field.value)?.name ?? ""}
                  onBlur={field.onBlur}
                  name={field.name}
                />
                <ComboboxContent>
                  <ComboboxEmpty>Marca no encontrada.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item.id} value={item.id}>
                        {item.name}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </Field>
          )}
        />

        <Separator className="col-span-2" />

        <div className="flex gap-2">
          <Controller
            control={form.control}
            name="cost"
            render={({ field, fieldState }) => (
              <Field>
                <FieldContent className="flex flex-row justify-between">
                  <FieldLabel>Costo</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Input placeholder="Ingrese Costo" type="text" {...field} disabled={viewModifyButton && !isModify} />
              </Field>
            )}
          />

          <Controller
            control={form.control}
            name="costUSD"
            render={({ field, fieldState }) => (
              <Field>
                <FieldContent className="flex flex-row justify-between">
                  <FieldLabel>Costo (USD)</FieldLabel>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </FieldContent>
                <Input
                  placeholder="Ingrese Costo USD"
                  type="text"
                  {...field}
                  disabled={viewModifyButton && !isModify}
                />
              </Field>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="costReferenceCurrency"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Moneda de Referencia</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                items={COST_REF_CURRENCY_ITEMS}
              >
                <SelectTrigger id="costReferenceCurrency" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Seleccionar moneda" />
                </SelectTrigger>

                <SelectContent>
                  {COST_REF_CURRENCY_ITEMS.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="costLogistics"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Costo de Logistica</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                placeholder="Ingrese Costo de Logistica"
                type="text"
                {...field}
                disabled={viewModifyButton && !isModify}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="costBonus"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Bonificación de Compra</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                placeholder="Ingrese Bonificación de Compra"
                type="text"
                {...field}
                disabled={viewModifyButton && !isModify}
              />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="ivaIncluded"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>IVA Incluido</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                placeholder="Ingrese IVA Incluido"
                type="text"
                {...field}
                disabled={viewModifyButton && !isModify}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="ivaApplied"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>IVA Aplicado</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Input
                placeholder="Ingrese IVA Aplicado"
                type="text"
                {...field}
                disabled={viewModifyButton && !isModify}
              />
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="marginDefault"
          render={({ field, fieldState }) => (
            <Field>
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Margen de Ganancia</FieldLabel>

                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>

              <Input
                placeholder="Ingrese Margen de Ganancia"
                type="number"
                {...field}
                value={field.value ?? 0}
                onChange={(event) => field.onChange(event.target.value === "" ? 0 : Number(event.target.value))}
                disabled={viewModifyButton && !isModify}
              />
            </Field>
          )}
        />

        <div className="flex flex-col gap-2">
          <FieldLabel>Precio Base</FieldLabel>
          <Input
            aria-label="Precio base"
            type="number"
            value={Number.isFinite(basePrice) ? basePrice : 0}
            disabled={viewModifyButton && !isModify}
            onChange={(event) => {
              const nextPrice = event.target.value === "" ? 0 : Number(event.target.value);
              setBasePrice(Number.isFinite(nextPrice) ? nextPrice : 0);
              if (smartCost > 0 && Number.isFinite(nextPrice)) {
                const nextMargin = (nextPrice / smartCost - 1) * 100;
                manualPriceChangeRef.current = true;
                form.setValue("marginDefault", Number(nextMargin.toFixed(4)), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }
            }}
          />
        </div>

        <Separator className="col-span-2" />

        <Controller
          control={form.control}
          name="stock"
          render={({ field, fieldState }) => (
            <Field className="flex flex-col col-span-2">
              <FieldContent className="flex flex-row justify-between">
                <FieldLabel>Stock</FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              {field.value?.map((stockItem, index) => (
                <div key={stockItem.depositId} className="flex items-center gap-3">
                  <Input type="hidden" {...form.register(`stock.${index}.depositId`)} />
                  <Input type="text" value={stockItem.depositName} disabled readOnly />
                  <Input
                    type="number"
                    placeholder="Cantidad"
                    {...form.register(`stock.${index}.quantity`, {
                      valueAsNumber: true,
                    })}
                    disabled={viewModifyButton && !isModify}
                  />
                </div>
              ))}
            </Field>
          )}
        />

        <Separator className="col-span-2" />

        <Controller
          name="isActiveShop"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-switch-twoFactor">Tienda Nube</FieldLabel>
                <FieldDescription>Activar y Sincronizar el producto en Tienda Nube</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Switch
                id="form-rhf-switch-twoFactor"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />

        <Controller
          name="discount"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="form-rhf-switch-twoFactor">Descuento</FieldLabel>
                <FieldDescription>Habilitar descuento modificable en facturador</FieldDescription>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
              <Switch
                id="form-rhf-switch-twoFactor"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />
      </FieldGroup>
      <Dialog>
        <DialogTrigger
          render={
            <Button type="button" disabled={!isValid || (!isModify && viewModifyButton)}>
              {product?.name ? "Guardar" : "Crear"}
            </Button>
          }
        />
        <DialogContent>
          <DialogTitle>{product?.name ? "Guardar" : "Crear"}</DialogTitle>
          <DialogDescription>Confirma {product?.name ? "Guardar" : "Crear"} Producto</DialogDescription>
          <Button type="submit" disabled={!isValid || isSubmitting} onClick={form.handleSubmit(onSubmit)}>
            {product?.name ? "Guardar" : "Crear"}
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
