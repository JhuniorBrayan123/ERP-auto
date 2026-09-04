import {expect, type Page} from '@playwright/test';
import {esperarCargaOverlaySiVisible} from "@utils/wait-helpers";
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
        await esperarCargaOverlaySiVisible(popupPage);
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


    private static readonly REGEX_TIPO_DESTINO: Record<string, RegExp> = {
        BOLETA: /^Boleta$/i,
        FACTURA: /^Factura$/i,
        'NOTA DE VENTA': /^Nota de venta$/i,
    };

    private async abrirAccionesExtra(popupPage: Page): Promise<void> {
        const accionesExtra = popupPage.locator(
            '[id="pv_cmp-ver-comprobante_common:cmp-ver-comprobante-acciones_acciones-extra:v-button"]',
        );
        if (await accionesExtra.isVisible({timeout: 3_000}).catch(() => false)) {
            await accionesExtra.click();
            await esperarCargaOverlaySiVisible(popupPage).catch(() => {
            });
        }
    }

    async abrirConvertirA(popupPage: Page): Promise<void> {
        const opcionConvertir = popupPage.getByText(/^convertir a/i).first();
        try {
            await opcionConvertir.click({timeout: 20_000});
        } catch {
            
            await this.abrirAccionesExtra(popupPage);
            await opcionConvertir.click({timeout: 10_000});
        }
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }

    async seleccionarTipoConvertir(popupPage: Page, tipo: string): Promise<void> {
        const regex = VerComprobantePopupPage.REGEX_TIPO_DESTINO[tipo] ?? new RegExp(`^${tipo}$`, 'i');
        await popupPage.getByText(regex).first().click();
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }


    async clickClonar(popupPage: Page): Promise<void> {
        const opcionClonar = popupPage.getByText(/^clonar/i).first();
        try {
            await opcionClonar.click({timeout: 20_000});
        } catch {
            
            await this.abrirAccionesExtra(popupPage);
            await opcionClonar.click({timeout: 10_000});
        }
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }


    async seleccionarCajaEnPopup(popupPage: Page, nombreCaja: string): Promise<void> {
        const cardEnPopup = popupPage.locator('.cmp-card-caja').filter({hasText: nombreCaja}).first();
        if (await cardEnPopup.isVisible({timeout: 5_000}).catch(() => false)) {
            await cardEnPopup.click();
            return;
        }
        await this.page.locator('.cmp-card-caja').filter({hasText: nombreCaja}).first().click();
    }


    async confirmarClonacionEnPopup(popupPage: Page): Promise<Page> {
        const popupPromise = popupPage.waitForEvent('popup');
        await popupPage.getByRole('button', {name: 'Continuar'}).click();
        return await popupPromise;
    }

    async seleccionarModoEdicion(popupPage: Page, modo: 'emitir-ahora' | 'editar-antes'): Promise<void> {
        const modal = popupPage.locator('.v-modal.is-open').filter({hasText: 'Selecciona el modo de edición'}).first();
        await modal.waitFor({state: 'visible', timeout: 15_000});

        const nombre = modo === 'emitir-ahora'
            ? /emitir (el comprobante )?ahora/i
            : /editar (los datos )?antes de emitir/i;
        await modal.getByRole('button', {name: nombre}).click();
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }


    async seleccionarCajaEnModalCajas(popupPage: Page, nombreCaja: string): Promise<void> {
        const card = popupPage.locator('.cmp-card-caja').filter({hasText: nombreCaja}).first();
        await card.click({timeout: 10_000});
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }

    async continuarModalCajas(popupPage: Page): Promise<void> {
        await popupPage.locator('[id="pv_shared_v-modal:cmp-grid-cajas_v-button:continuar"]').click();
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }


    async emitirDesdeRevisarDatos(popupPage: Page): Promise<void> {
        await popupPage.locator(
            '[id="pv_cmp-ver-comprobante_v-modal:emision-cotizacion-pedido_v-button:emitir"]',
        ).click({timeout: 15_000});
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }

    async continuarVendiendoCajaEnLista(popupPage: Page, nombreCaja: string): Promise<void> {
        const card = popupPage.locator('.cmp-descripcion').filter({hasText: nombreCaja}).first();
        const boton = card.getByRole('button', {name: /continuar vendiendo|aperturar caja/i});
        await boton.click({timeout: 15_000});
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }
}