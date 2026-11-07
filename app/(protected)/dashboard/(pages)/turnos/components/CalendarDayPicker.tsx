"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date;
  onChange: (value: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha y hora",
  disabled,
}: DateTimePickerProps) {
  const selectedDate = value ? new Date(value) : undefined;

  const updateDate = (date: Date) => {
    const newDate = new Date(date);

    if (selectedDate) {
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    }

    onChange(newDate);
  };

  const updateTime = (time: string) => {
    if (!selectedDate || !time) return;

    const [hours, minutes] = time.split(":").map(Number);

    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);

    onChange(newDate);
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="flex-1 justify-start text-left font-normal"
            >
              {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: es }) : placeholder}
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={es}
            selected={selectedDate}
            onSelect={(date) => {
              if (date) updateDate(date);
            }}
          />
        </PopoverContent>
      </Popover>

      <Input
        type="time"
        className="w-32"
        disabled={disabled || !selectedDate}
        value={selectedDate ? format(selectedDate, "HH:mm") : ""}
        onChange={(e) => updateTime(e.target.value)}
      />
    </div>
  );
}
