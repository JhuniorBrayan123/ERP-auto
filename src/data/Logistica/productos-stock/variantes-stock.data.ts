import type {StockConfig} from "@app-types/item-data.types";

export interface CasoVariantesStock {
    titulo: string;
    id: string;
    desc: string;
    precios: { venta: string; compra: string };
    stock?: StockConfig;
}

export const CASOS_VARIANTES_STOCK: CasoVariantesStock[] = [
    {
        titulo: "SC-12: crear y borrar atributo, luego agregar variantes — sin control @PS-03.12",
        id: "12",
        desc: "sin control",
        precios: {venta: "25", compra: "15"},
    },
    {
        titulo: "SC-13: crear y borrar atributo, luego agregar variantes — flexible @PS-03.13",
        id: "13",
        desc: "flexible",
        precios: {venta: "30", compra: "18"},
        stock: {tipo: "flexible", cantidadMaxima: "500", cantidadMinima: "10"},
    },
    {
        titulo: "SC-14: crear y borrar atributo, luego agregar variantes — estricto @PS-03.14",
        id: "14",
        desc: "estricto",
        precios: {venta: "35", compra: "22"},
        stock: {tipo: "estricto", cantidadMaxima: "300", cantidadMinima: "5"},
    },
] as const;

export const TEMP_OPCIONES = ["opcion 1", "opcion 2", "opcion 3"] as const;
