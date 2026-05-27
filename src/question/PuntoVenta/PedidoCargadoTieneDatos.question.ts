import {expect, type Page} from '@playwright/test';

export interface DatosEsperados {
    vendedor?: string;
    ordenCompra?: string;
    contrato?: string;
    placa?: string;
    guia?: string;
    campoTexto0?: string;
    campoNumero0?: string;
}

export const PedidoCargadoTieneDatos = (datos: DatosEsperados) =>
    async (page: Page): Promise<boolean> => {
        try {
            if (datos.vendedor) {
                await expect(page.getByText(datos.vendedor)).toBeVisible({ timeout: 5000 });
            }
            if (datos.ordenCompra) {
                await expect(page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]')).toHaveValue(datos.ordenCompra);
            }
            if (datos.contrato) {
                await expect(page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]')).toHaveValue(datos.contrato);
            }
            if (datos.placa) {
                await expect(page.getByRole('textbox', { name: 'Ej. A1G-' })).toHaveValue(datos.placa);
            }
            if (datos.guia) {
                await expect(page.getByRole('textbox', { name: 'Ej. G001-' })).toHaveValue(datos.guia);
            }
            if (datos.campoTexto0) {
                await expect(page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]')).toHaveValue(datos.campoTexto0);
            }
            if (datos.campoNumero0) {
                await expect(page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]')).toHaveValue(datos.campoNumero0);
            }
            return true;
        } catch {
            return false;
        }
    };
