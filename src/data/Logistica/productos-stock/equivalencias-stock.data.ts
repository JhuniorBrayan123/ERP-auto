import type {StockConfig} from "@app-types/item-data.types";

export interface CasoEquivalenciaStock {
    titulo: string;
    id: string;
    desc: string;
    precios: { venta: string; compra: string };
    stock: StockConfig;
    equivalencia: {
        nombre: string;
        factor: number;
        precioVenta: string;
        precioCompra: string;
    };
}

export const CASOS_EQUIVALENCIA_STOCK: CasoEquivalenciaStock[] = [
    {
        titulo: "SC-15: crear producto con equivalencia — stock sin control @PS-03.15",
        id: "15",
        desc: "sin control",
        precios: {venta: "25", compra: "15"},
        stock: {tipo: "sin_control"},
        equivalencia: {nombre: "Pack 6 unidades", factor: 6, precioVenta: "120", precioCompra: "80"},
    },
    {
        titulo: "SC-16: crear producto con equivalencia — stock flexible @PS-03.16",
        id: "16",
        desc: "flexible",
        precios: {venta: "30", compra: "20"},
        stock: {tipo: "flexible", cantidadMaxima: "300", cantidadMinima: "5"},
        equivalencia: {nombre: "Pack 6 unidades", factor: 6, precioVenta: "150", precioCompra: "100"},
    },
    {
        titulo: "SC-17: crear producto con equivalencia — stock estricto @PS-03.17",
        id: "17",
        desc: "estricto",
        precios: {venta: "40", compra: "25"},
        stock: {tipo: "estricto", cantidadMaxima: "200", cantidadMinima: "10"},
        equivalencia: {nombre: "Caja x 12", factor: 12, precioVenta: "400", precioCompra: "250"},
    },
] as const;
