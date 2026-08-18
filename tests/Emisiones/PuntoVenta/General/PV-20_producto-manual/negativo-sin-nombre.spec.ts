import {test, expect} from '@playwright/test';
import {Cajero} from '@actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {ProductoManualTargets} from '@screenplay/targets/facturacion/ProductoManualTargets';
import type {Page} from '@playwright/test';

test.describe('PV-20 | Producto Manual — Negativo', {tag: ['@puntoventa', '@pv-20']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('SC-03: No permite agregar producto manual sin nombre @PV-20.3', async ({page}) => {
        const cajero = Cajero.con(page);

        await test.step('Given: abrir drawer de producto manual', async () => {
            await cajero.intentaRealizar(async (page: Page) => {
                await ProductoManualTargets.btnProductoManual(page).click();
                await expect(ProductoManualTargets.textareaNombre(page)).toBeVisible({timeout: 10_000});
            });
        });

        await test.step('When: intentar agregar sin completar el nombre', async () => {
            await cajero.intentaRealizar(async (page: Page) => {
                await ProductoManualTargets.inputCantidad(page).fill('1');
                await ProductoManualTargets.inputPrecioBase(page).click();
                await ProductoManualTargets.inputPrecioBase(page).fill('10');
                await ProductoManualTargets.inputPrecioFinal(page).click();
                await ProductoManualTargets.inputPrecioFinal(page).fill('10');
                await ProductoManualTargets.btnAgregarProducto(page).click();
            });
        });

        await test.step('Then: validar que aparece error de campo obligatorio', async () => {
            await cajero.intentaRealizar(async (page: Page) => {
                await expect(ProductoManualTargets.campoObligatorioError(page)).toBeVisible({timeout: 5_000});
                await expect(ProductoManualTargets.textareaNombre(page)).toBeVisible();
            });
        });
    });
});
