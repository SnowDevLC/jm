import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearFechaCAE(fecha: string): string {
  const anio = fecha.slice(0, 4);
  const mes = fecha.slice(4, 6);
  const dia = fecha.slice(6, 8);

  return `${dia}/${mes}/${anio}`;
}

export function formatearFecha(date: Date): string {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const anio = date.getFullYear();

  return `${dia}/${mes}/${anio}`;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeBarcode(barcode: string) {
  return barcode.replace(/[^\x20-\x7E]/g, "").trim();
}

export function normalizeSearch(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, " ")
    .trim()
    .replace(/s$/, ""); // quita plural simple
}

export function normalizeText(text: string) {
  return text
    ?.toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function formatCurrency(number: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(Number(number));
}
