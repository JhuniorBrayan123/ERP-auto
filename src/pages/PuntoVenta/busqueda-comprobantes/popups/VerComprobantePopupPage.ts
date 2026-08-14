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

    // =========================================================================
    // Camino C (conversion-cotizacion-pedido-comprobantes): "Convertir a" y
    // "Clonar" dentro del popup de Ver Comprobante.
    //
    // DOM discovery (Fase 0/apply 13-Ago-2026): "Convertir a" y "Clonar" no
    // tienen data-testid documentado en el popup. El popup expone el botón
    // "Acciones extra" (`pv_cmp-ver-comprobante_common:...acciones-extra:v-button`,
    // ya usado por Datos opcionales / Ver bitácora) que abre un menú con las
    // acciones del documento; "Convertir a" y "Clonar" se localizan con fallbacks
    // por rol/texto (regex anclada) para no colisionar con otras cadenas.
    // =========================================================================

    /** Texto visible de cada tipo destino en el menú "Convertir a". */
    private static readonly REGEX_TIPO_DESTINO: Record<string, RegExp> = {
        BOLETA: /^Boleta$/i,
        FACTURA: /^Factura$/i,
        'NOTA DE VENTA': /^Nota de venta$/i,
    };

    /** Abre el menú "Acciones extra" del popup si está visible. */
    private async abrirAccionesExtra(popupPage: Page): Promise<void> {
        const accionesExtra = popupPage.locator(
            '[id="pv_cmp-ver-comprobante_common:cmp-ver-comprobante-acciones_acciones-extra:v-button"]',
        );
        if (await accionesExtra.isVisible({timeout: 3_000}).catch(() => false)) {
            await accionesExtra.click();
            await esperarCargaOverlay(popupPage).catch(() => {
            });
        }
    }

    /**
     * Abre el menú "Convertir a" dentro del popup de Ver Comprobante.
     * Primero abre "Acciones extra" (donde vive el menú del documento) y luego
     * localiza "Convertir a" por texto; fallback por botón/link que empiece con
     * "Convertir".
     */
    async abrirConvertirA(popupPage: Page): Promise<void> {
        await this.abrirAccionesExtra(popupPage);

        const opcionConvertir = popupPage.getByText(/^convertir a/i).first();
        if (await opcionConvertir.isVisible({timeout: 3_000}).catch(() => false)) {
            await opcionConvertir.click();
            await esperarCargaOverlay(popupPage).catch(() => {
            });
            return;
        }

        // Fallback: botón/link directo que empiece con "Convertir"
        await popupPage.getByRole('button', {name: /^convertir/i}).first()
            .or(popupPage.getByRole('link', {name: /^convertir/i}).first())
            .click();
        await esperarCargaOverlay(popupPage).catch(() => {
        });
    }

    /**
     * Selecciona el tipo destino (Boleta/Factura/Nota de venta) en el menú
     * "Convertir a". Coincidencia anclada e insensible a mayúsculas para tolerar
     * "Boleta" o "BOLETA" sin colisionar con otras cadenas del popup.
     */
    async seleccionarTipoConvertir(popupPage: Page, tipo: string): Promise<void> {
        const regex = VerComprobantePopupPage.REGEX_TIPO_DESTINO[tipo] ?? new RegExp(`^${tipo}$`, 'i');
        await popupPage.getByText(regex).first().click();
        await esperarCargaOverlay(popupPage).catch(() => {
        });
    }

    /**
     * Click en "Clonar" dentro del popup de Ver Comprobante (abre el selector
     * de caja). Acepta "Clonar" o "Clonar comprobante" (regex anclada).
     */
    async clickClonar(popupPage: Page): Promise<void> {
        await this.abrirAccionesExtra(popupPage);

        const opcionClonar = popupPage.getByText(/^clonar/i).first();
        if (await opcionClonar.isVisible({timeout: 3_000}).catch(() => false)) {
            await opcionClonar.click();
        } else {
            // Fallback: botón/link directo que empiece con "Clonar"
            await popupPage.getByRole('button', {name: /^clonar/i}).first()
                .or(popupPage.getByRole('link', {name: /^clonar/i}).first())
                .click();
        }
        await esperarCargaOverlay(popupPage).catch(() => {
        });
    }

    /**
     * Selecciona la caja destino para clonar. Busca primero dentro del popup de
     * Ver Comprobante y, si no aparece, cae a la página principal (grilla) —
     * mismo patrón `.cmp-card-caja` que ComprobantesAccionesComponent.
     */
    async seleccionarCajaEnPopup(popupPage: Page, nombreCaja: string): Promise<void> {
        const cardEnPopup = popupPage.locator('.cmp-card-caja').filter({hasText: nombreCaja}).first();
        if (await cardEnPopup.isVisible({timeout: 5_000}).catch(() => false)) {
            await cardEnPopup.click();
            return;
        }
        await this.page.locator('.cmp-card-caja').filter({hasText: nombreCaja}).first().click();
    }

    /**
     * Confirma la clonación ("Continuar") desde el popup de Ver Comprobante y
     * devuelve la Page del popup de emisión (ventana nueva con la venta cargada).
     */
    async confirmarClonacionEnPopup(popupPage: Page): Promise<Page> {
        const popupPromise = popupPage.waitForEvent('popup');
        await popupPage.getByRole('button', {name: 'Continuar'}).click();
        return await popupPromise;
    }
}