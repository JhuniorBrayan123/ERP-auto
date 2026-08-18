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

    // =========================================================================
    // Camino C (conversion-cotizacion-pedido-comprobantes): "Convertir a" y
    // "Clonar" dentro del popup de Ver Comprobante.
    //
    // DOM discovery (apply 14-Ago-2026, CRT-1): "Convertir a" y sus sub-opciones
    // (Factura/Boleta/Nota de venta/Clonar/Descargar PDF/Imprimir/Enviar...) son
    // SIEMPRE visibles en el popup — NO viven bajo "Acciones extra" (ese botón es
    // independiente y se mantiene como fallback por compatibilidad). Tras elegir
    // el tipo destino aparece el modal "Selecciona el modo de edición"
    // (`.v-modal.is-open` con header `.v-modal-header.orange`) con los botones
    // "Emitir ahora" (danger) y "Editar antes de emitir" (info). El accessible
    // name de ambos es la versión CORTA ("Emitir ahora", "Editar antes de
    // emitir") aunque los spans muestren el texto largo ("Emitir el comprobante
    // ahora" / "Editar los datos antes de emitirlo").
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
            await esperarCargaOverlaySiVisible(popupPage).catch(() => {
            });
        }
    }

    /**
     * Abre el menú "Convertir a" dentro del popup de Ver Comprobante.
     *
     * DOM discovery 14-Ago-2026: "Convertir a" es SIEMPRE visible en el popup
     * (menú desplegable propio, sin pasar por "Acciones extra"). El popup es un
     * SPA: su contenido tarda ~6s en renderizarse (debug 14-Ago-2026), por lo
     * que el camino principal es TEXTO con espera generosa; "Acciones extra"
     * queda como fallback de compatibilidad con builds anteriores.
     */
    async abrirConvertirA(popupPage: Page): Promise<void> {
        const opcionConvertir = popupPage.getByText(/^convertir a/i).first();
        try {
            await opcionConvertir.click({timeout: 20_000});
        } catch {
            // Fallback (compatibilidad): "Acciones extra" → "Convertir a"
            await this.abrirAccionesExtra(popupPage);
            await opcionConvertir.click({timeout: 10_000});
        }
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
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
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }

    /**
     * Click en "Clonar" dentro del popup de Ver Comprobante (abre el selector
     * de caja). Acepta "Clonar" o "Clonar comprobante" (regex anclada).
     * El popup es un SPA (~6s de render): camino principal por TEXTO con espera
     * generosa; "Acciones extra" como fallback de compatibilidad.
     */
    async clickClonar(popupPage: Page): Promise<void> {
        const opcionClonar = popupPage.getByText(/^clonar/i).first();
        try {
            await opcionClonar.click({timeout: 20_000});
        } catch {
            // Fallback (compatibilidad): "Acciones extra" → "Clonar"
            await this.abrirAccionesExtra(popupPage);
            await opcionClonar.click({timeout: 10_000});
        }
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
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

    // =========================================================================
    // Camino C — Wizard de conversión (DOM discovery 14-Ago-2026, CRT-1):
    // tras elegir el tipo destino se abre el modal "Selecciona el modo de
    // edición"; "Emitir ahora" continúa en la MISMA popup (modal de cajas →
    // "Revisa tus datos" → pago) y "Editar antes de emitir" abre una VENTANA
    // NUEVA con la lista de cajas (`/punto-venta/cajas?goto=...`).
    // =========================================================================

    /**
     * Selecciona el modo de edición en el modal "Selecciona el modo de edición".
     * `modo='emitir-ahora'` → continúa en la misma popup (modal de cajas).
     * `modo='editar-antes'` → abre ventana nueva con la lista de cajas.
     */
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

    /**
     * Selecciona la caja destino en el modal "Selecciona una caja de ventas"
     * (que se abre tras "Emitir ahora"). Patrón `.cmp-card-caja` igual que la
     * grilla (ComprobantesAccionesComponent).
     */
    async seleccionarCajaEnModalCajas(popupPage: Page, nombreCaja: string): Promise<void> {
        const card = popupPage.locator('.cmp-card-caja').filter({hasText: nombreCaja}).first();
        await card.click({timeout: 10_000});
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }

    /** Click en "Continuar" del modal de cajas (id real verificado en DOM). */
    async continuarModalCajas(popupPage: Page): Promise<void> {
        await popupPage.locator('[id="pv_shared_v-modal:cmp-grid-cajas_v-button:continuar"]').click();
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }

    /**
     * Click en "Emitir" del modal "Revisa tus datos antes de pagar" (id real
     * `pv_cmp-ver-comprobante_v-modal:emision-cotizacion-pedido_v-button:emitir`).
     * Este modal reemplaza al flujo de pago directo: tras "Emitir" se abre el
     * modal `.cmp-realizar-pago` (Monto exacto / Realizar Pago).
     */
    async emitirDesdeRevisarDatos(popupPage: Page): Promise<void> {
        await popupPage.locator(
            '[id="pv_cmp-ver-comprobante_v-modal:emision-cotizacion-pedido_v-button:emitir"]',
        ).click({timeout: 15_000});
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }

    /**
     * En la lista de cajas (ventana nueva del modo "Editar antes de emitir",
     * `/punto-venta/cajas?goto=...`) clickea "Continuar vendiendo" en la card de
     * la caja indicada.
     *
     * DOM real (trace retry2 14-Ago-2026): el botón de la card usa SIEMPRE el id
     * `pv_cajas_caja-venta_cmp-descripcion_v-button:abrir-modal-apertura-caja`
     * — el slug "caja-venta" es la key INTERNA de la caja, NO se deriva del
     * nombre visible ("Caja de venta" → "caja-de-venta"), y ese mismo id se
     * REPITE en todas las cards de la lista, por lo que un selector por id no
     * puede localizar una caja concreta. Se ubica la card por su título
     * (`.cmp-descripcion`) y se clickea su botón, cuyo texto es "Continuar
     * vendiendo" (caja abierta) o "Aperturar caja" (caja cerrada). Tras el
     * click, la página navega a la caja (`/punto-venta/boleta/{caja}` según el
     * query `goto`) con el documento del comprobante origen ya cargado.
     */
    async continuarVendiendoCajaEnLista(popupPage: Page, nombreCaja: string): Promise<void> {
        const card = popupPage.locator('.cmp-descripcion').filter({hasText: nombreCaja}).first();
        const boton = card.getByRole('button', {name: /continuar vendiendo|aperturar caja/i});
        await boton.click({timeout: 15_000});
        await esperarCargaOverlaySiVisible(popupPage).catch(() => {
        });
    }
}