"use client";

import { useNextCalendarApp, ScheduleXCalendar } from "@schedule-x/react";

import { createViewDay, createViewMonthGrid, createViewWeek } from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";

import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";

import { TURN_STATUS, TurnType } from "../lib/zodTurns";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const TIMEZONE = "America/Argentina/Cordoba";

interface CalendarTurnsProps {
  turns: TurnType[];
}

const STATUS_DOTS: Record<string, string> = {
  PENDIENTE: "🟡",
  TERMINADO: "🟢",
  CANCELADO: "🔴",
};

export function CalendarTurns({ turns }: CalendarTurnsProps) {
  const [selectedTurn, setSelectedTurn] = useState<TurnType | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [eventsService] = useState(() => createEventsServicePlugin());

  const events = turns.map((turn) => ({
    id: turn.id,
    title: `${STATUS_DOTS[turn.status]} ${turn.car} - ${turn.description || turn.category}`,

    start: Temporal.Instant.from(new Date(turn.startsAt).toISOString()).toZonedDateTimeISO(TIMEZONE),

    end: Temporal.Instant.from(new Date(turn.endsAt).toISOString()).toZonedDateTimeISO(TIMEZONE),

    status: turn.status,
    car: turn.car,
    category: turn.category,
    description: turn.description,
    clientId: turn.client.id,

    _options: {
      additionalClasses: [`turn-${turn.category.toLowerCase()}`],
    },
  }));

  const calendar = useNextCalendarApp({
    locale: "es-ES",
    timezone: TIMEZONE,
    firstDayOfWeek: 1,

    defaultView: createViewMonthGrid().name,

    views: [createViewMonthGrid(), createViewWeek(), createViewDay()],

    events,

    plugins: [eventsService],

    callbacks: {
      onEventClick(event) {
        const turn = turns.find((item) => item.id === event.id);

        if (turn) {
          setSelectedTurn(turn);
          setOpenDetail(true);
        }
      },
    },
  });

  useEffect(() => {
    eventsService.set(events);
  }, [events, eventsService]);

  return (
    <div className="flex-1 min-h-0 w-full p-2">
      <ScheduleXCalendar calendarApp={calendar} />
      <Sheet open={openDetail} onOpenChange={setOpenDetail}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          {selectedTurn && (
            <>
              <SheetHeader>
                <SheetTitle>Detalle del turno</SheetTitle>

                <SheetDescription>Información del servicio agendado.</SheetDescription>
              </SheetHeader>

              <div className="px-4 space-y-5">
                {/* Cliente */}
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{selectedTurn.client.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTurn.client.phone}</p>
                </div>

                {/* Vehículo */}
                <div>
                  <p className="text-sm text-muted-foreground">Vehículo</p>
                  <p className="font-semibold">{selectedTurn.car}</p>
                </div>

                {/* Categoría */}
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-semibold">{selectedTurn.category}</p>
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Inicio</p>
                    <p className="font-medium">
                      {format(new Date(selectedTurn.startsAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Finalización</p>
                    <p className="font-medium">
                      {format(new Date(selectedTurn.endsAt), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge
                    className={
                      selectedTurn.status === "TERMINADO"
                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400"
                        : selectedTurn.status === "CANCELADO"
                          ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400"
                    }
                  >
                    {TURN_STATUS[selectedTurn.status].label}
                  </Badge>
                </div>

                {/* Descripción */}
                <div>
                  <p className="text-sm text-muted-foreground">Descripción</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedTurn.description || "Sin descripción"}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
