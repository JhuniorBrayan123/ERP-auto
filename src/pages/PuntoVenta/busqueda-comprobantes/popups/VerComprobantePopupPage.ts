import {expect, type Page} from '@playwright/test';
import {esperarCargaOverlay} from "@utils/wait-helpers";
import type {DatosOpcionales} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

export class VerComprobantePopupPage {
    constructor(private readonly page: Page) {
    }

    async abrirVerComprobante(): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('link', {name: 'Ver comprobante'}).click();
        return popupPromise;
    }

    async abrirVerComprobanteDesdeMenu(): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('link', {name: 'Ver comprobante'}).click();
        const popupPage = await popupPromise;
        await esperarCargaOverlay(popupPage);
        return popupPage;
    }

    async validarRetencionEnPopup(popupPage: Page, porcentaje: string): Promise<void> {
        await expect(
            popupPage.getByText(`ESTE DOCUMENTO ESTA AFECTO A RETENCION DEL ${porcentaje}%`),
        ).toBeVisible({timeout: 30_000});
    }

    async validarDetraccionEnPopup(popupPage: Page): Promise<void> {
        await expect(
            popupPage.getByText('OPERACIÓN SUJETA AL SISTEMA'),
        ).toBeVisible({timeout: 30_000});
    }

    async validarFacturaAdelantoEnPopup(popupPage: Page): Promise<void> {
        await expect(
            popupPage.getByText('Factura de adelanto'),
        ).toBeVisible({timeout: 30_000});
    }

    async validarAdelantosAplicadosEnPopup(popupPage: Page): Promise<void> {
        const adelantos = popupPage.getByText('Adelantos aplicados').nth(1);
        const comprobantes = popupPage.getByText('Comprobantes de aplicación').nth(1);

        await expect(adelantos.or(comprobantes)).toBeVisible({timeout: 30_000});
    }

    async clickAccionesExtra(popupPage: Page): Promise<void> {
        await popupPage.getByRole('button', {name: 'Acciones extra'}).click();
    }

    async clickDatosOpcionales(popupPage: Page): Promise<void> {
        await popupPage.getByText('Datos opcionales').click();
    }

    async cerrarDrapePopup(popupPage: Page): Promise<void> {
        await popupPage.locator('.drape.is-open > .button-close > .icon').click();
    }

    async abrirDatosOpcionalesEnPopup(popupPage: Page): Promise<void> {
        await popupPage.locator(
            '[id="pv_cmp-ver-comprobante_common:cmp-ver-comprobante-acciones_acciones-extra:v-button"]',
        ).click();
        await popupPage.getByText('Datos opcionales').click();
    }

    async validarDatosOpcionalesEnPopup(popupPage: Page, datos: DatosOpcionales): Promise<void> {
        const drape = popupPage.locator('.drape.is-open');
        await expect(drape).toContainText(datos.vendedorNombre);
        const detalle = drape.locator('.extra-content-detalle');
        await expect(detalle.filter({hasText: 'Orden de compra'}).locator('input.erp-input')).toHaveValue(datos.ordenCompra);
        await expect(detalle.filter({hasText: 'Contrato'}).locator('input.erp-input')).toHaveValue(datos.contrato);
        await expect(detalle.filter({hasText: 'Observaciones'}).locator('input.erp-input')).toHaveValue(datos.comentarios);
        const campoOpcional = drape.locator('.campo-opcional');
        await expect(campoOpcional.filter({hasText: 'tipo de comprobante'}).locator('input.erp-input')).toHaveValue(datos.campoTexto0);
        await expect(campoOpcional.filter({hasText: 'numero-comprobante'}).locator('input.erp-input')).toHaveValue(datos.campoNumero0);
    }

    async abrirBitacoraDesdePopup(popupPage: Page): Promise<void> {
        await popupPage.locator(
            '[id="pv_cmp-ver-comprobante_common:cmp-ver-comprobante-acciones_acciones-extra:v-button"]',
        ).click();
        await popupPage.getByRole('button', {name: 'Ver bitácora'}).click().catch(async () => {
            await popupPage.locator('[class*="bitacora"], [class*="bitácora"]').click();
        });
    }
}
