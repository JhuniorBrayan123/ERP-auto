import {type Page} from '@playwright/test';

export interface DatosOpcionales {
    vendedorDoc?: string;
    vendedorSelector?: string;
    ordenCompra?: string;
    contrato?: string;
    placa?: string;
    guia?: string;
    comentarios?: string;
    campoTexto0?: string;
    campoNumero0?: string;
}

export const LlenarDatosOpcionales = (datos: DatosOpcionales) => {
    const fn = async (page: Page): Promise<void> => {
        await page.getByRole('button', { name: 'Datos' }).click();

        if (datos.vendedorDoc) {
            const inputVendedor = page.getByRole('textbox', { name: 'Nombre del vendedor' });
            await inputVendedor.click();
            await inputVendedor.fill(datos.vendedorDoc);
            if (datos.vendedorSelector) {
                await page.getByText(datos.vendedorSelector).click();
            }
        }

        if (datos.ordenCompra) {
            const input = page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:orden-compra"]');
            await input.click();
            await input.fill(datos.ordenCompra);
        }

        if (datos.contrato) {
            const input = page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:contrato"]');
            await input.click();
            await input.fill(datos.contrato);
        }

        if (datos.placa) {
            const input = page.getByRole('textbox', { name: 'Ej. A1G-' });
            await input.click();
            await input.fill(datos.placa);
        }

        if (datos.guia) {
            const input = page.getByRole('textbox', { name: 'Ej. G001-' });
            await input.click();
            await input.fill(datos.guia);
        }

        if (datos.comentarios) {
            const input = page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:comentarios"]');
            await input.click();
            await input.fill(datos.comentarios);
        }

        if (datos.campoTexto0) {
            const input = page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-texto-0"]');
            await input.click();
            await input.fill(datos.campoTexto0);
        }

        if (datos.campoNumero0) {
            const input = page.locator('[id="pv_ventas_cmp-punto-venta_v-drape:cmp-datos-opcionales_v-input:campo-numero-0"]');
            await input.click();
            await input.fill(datos.campoNumero0);
        }

        await page.getByRole('button', { name: 'Guardar datos' }).click();
    };
    fn.displayName = 'Llenar datos opcionales';
    return fn;
};
