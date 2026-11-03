"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { ExchangeRateTypeType } from "../lib/zodConfig";
import FormExchangeRateType from "./FormExchangeRateType";
import { columnsExchangeRateTypes } from "./columnsExchangeRateTypes";

type ListExchangeRatesTypesProps = {
  exchangeRateTypes: ExchangeRateTypeType[];
};

export default function ListExchangeRatesTypes(props: ListExchangeRatesTypesProps) {
  const { exchangeRateTypes } = props;
  const [openModalCreate, setOpenModalCreate] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <h2>Cotizaciones</h2>
        <Dialog open={openModalCreate} onOpenChange={setOpenModalCreate}>
          <DialogTrigger
            render={
              <Button className="gap-x-2">
                <CirclePlus />
                Crear Tipo de Cotización
              </Button>
            }
          />

          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Crear Tipo de Cotización</DialogTitle>
              <DialogDescription>Crear y Editar Tipo de Cotización</DialogDescription>
            </DialogHeader>
            <FormExchangeRateType setOpenModalForm={setOpenModalCreate} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable
        data={exchangeRateTypes}
        columns={columnsExchangeRateTypes}
        searchName
        pagination={false}
        toolbar={false}
      />
    </div>
  );
}
