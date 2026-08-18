import {test, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {AgregarProductoManual} from '@screenplay/interactions/facturacion/AgregarProductoManual';
import type {Page} from '@playwright/test';

test.describe('PV-20 | Producto Manual — Efímero', {tag: ['@puntoventa', '@pv-20']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-04: Producto manual efímero se agrega a la grilla sin guardar en lista @PV-20.4', async ({page}) => {
        const cajero = Cajero.con(page);
        const nombreUnico = `PM Efímero ${Date.now()}`;

        const PRODUCTO_EFIMERO = {
            nombre: nombreUnico,
            cantidad: 1,
            precioBase: 10.00,
            precioFinal: 10.00,
            guardarEnLista: false,
        };

        await test.step('Given: agregar producto manual efímero (sin guardar en lista)', async () => {
            await cajero.intentaRealizar(
                AgregarProductoManual(PRODUCTO_EFIMERO)
            );
        });

        await test.step('Then: el producto aparece en la grilla de venta', async () => {
            await cajero.intentaRealizar(async (page: Page) => {
                const fila = page.getByText(nombreUnico);
                await expect(fila).toBeVisible({timeout: 5_000});
            });
        });
    });
});
