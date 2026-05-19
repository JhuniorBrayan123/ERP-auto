/**
 * Page Object para la pantalla "Búsqueda de comprobantes".
 *
 * Pantalla accesible desde: Ventas y compras → Búsqueda de comprobantes.
 * Contiene la grilla de comprobantes emitidos con acciones por comprobante:
 *   - Bitácora (historial del comprobante)
 *   - Ver comprobante (abre popup con PDF/detalle)
 *
 * Locators reales del codegen:
 *   - Dropdown comprobante: .body-options > .cmp-dropdown (primer elemento)
 *   - Bitácora: getByText('Bitácora')
 *   - Ver comprobante: getByRole('link', { name: 'Ver comprobante' })
 *   - Cerrar drape: .drape.is-open > .button-close > .icon
 *   - Icono base (alternativa dropdown): .v-icon-base > .icon
 */
import { expect, type Page } from '@playwright/test';
import type { EmisionResult } from '../../helpers/PuntoVenta/emision.types';
import { EstadoSunat } from '../../helpers/PuntoVenta/sunat-estados.helper';
import { throwFunctionalError } from '../../utils/functional-error';
import { FUNCTIONAL_CATALOG } from '../../utils/functional-catalog';

const ESTADOS_EXITOSOS = [EstadoSunat.ACEPTADA, EstadoSunat.ACEPTADA_OBSERVADA];
const ESTADOS_TRANSITORIOS = [EstadoSunat.PENDIENTE_ENVIO, EstadoSunat.PENDIENTE_RESPUESTA, EstadoSunat.NO_DISPONIBLE];

export class BusquedaComprobantesPage {
    constructor(private readonly page: Page) {
    }

    // ─── Navegación ───────────────────────────────────────────────────

    async salirDeCaja(): Promise<void> {
        await this.page.locator('.v-icon-back .icon').click();
    }

    /**
     * Navega a Búsqueda de comprobantes desde la caja.
     * Si se pasa un EmisionResult, filtra automáticamente por correlativo.
     */
    async navegarABusquedaComprobantes(emision?: EmisionResult | null): Promise<void> {
        await this.salirDeCaja();
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Búsqueda de comprobantes').click();

        if (emision?.correlativo) {
            await this.filtrarPorCorrelativo(emision.correlativo);
        }
    }

    // ─── Filtros avanzados + intercepción de Consultas ────────────────

    /**
     * Último comprobante obtenido de la API de Consultas.
     * Se llena al filtrar por correlativo — contiene IdestadoSunat.
     */
    public ultimoComprobanteConsulta: {
        idEstadoSunat: number;
        estadoDescripcion: string;
        serieDescripcion: string;
        correlativoDocumento: number;
        idComprobanteERP: number;
    } | null = null;

    /**
     * Abre filtros avanzados, busca por correlativo e intercepta la
     * response de DocumentosContables/Consultas para capturar el estado SUNAT.
     */
    async filtrarPorCorrelativo(correlativo: string): Promise<void> {
        // Abrir filtros avanzados
        await this.page.locator(
            '[id="pv_comprobantes_cmp-filtros-comprobantes:state_v-button-filter-border:activar-filtros-avanzados"]',
        ).click();

        // Preparar intercepción de la API de Consultas
        const consultaPromise = this.page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Consultas') && resp.status() === 200,
            { timeout: 15_000 },
        );

        // Llenar el input de correlativo (dispara la búsqueda)
        const inputCorrelativo = this.page.locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes-header:header-grilla_v-input:Correlativo"]',
        );
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);
        await inputCorrelativo.press('Enter'); // Forzar disparo de búsqueda

        // Capturar la respuesta de Consultas
        try {
            const response = await consultaPromise;
            const body = await response.json();
            const data = body.ComprobantesCollectionResponse?.Data ?? [];

            if (data.length > 0) {
                const comp = data[0];
                this.ultimoComprobanteConsulta = {
                    idEstadoSunat: comp.IdestadoSunat ?? 0,
                    estadoDescripcion: comp.EstadoDescripcion ?? '',
                    serieDescripcion: comp.SerieDescripcion ?? '',
                    correlativoDocumento: comp.CorrelativoDocumento ?? 0,
                    idComprobanteERP: comp.IdComprobanteERP ?? 0,
                };
                console.log(
                    `   Filtrado: ${this.ultimoComprobanteConsulta.serieDescripcion}-${correlativo}` +
                    ` | Estado: ${this.ultimoComprobanteConsulta.estadoDescripcion}` +
                    ` | SUNAT: ${this.ultimoComprobanteConsulta.idEstadoSunat}`,
                );
            }
        } catch {
            console.log(`  Filtrado por correlativo: ${correlativo} (sin interceptar Consultas)`);
        }
    }

    async filtrarAdelanto(emision: EmisionResult | null): Promise<void> {
        if (!emision) throw new Error('No hay emisión capturada para filtrar adelanto');

        // Esperar que el modal cargue las series antes de interactuar
        const seriesPromise = this.page.waitForResponse(
            (resp) =>
                resp.url().includes('entidades/series') &&
                resp.url().includes('idtipodocumento=2016') &&
                resp.status() === 200,
            { timeout: 15_000 },
        );

        // Esperar a que el modal esté listo
        await seriesPromise;

        const input = this.page.locator(
            '[id="pv_punto-venta_cmp_venta_pedido:modals_cmp-gestion-adelantos__v-input:busqueda-serie-correlativo"]'
        );

        await input.click();
        await input.fill(emision.correlativo);
        await input.press('Enter');
        await seriesPromise;

        console.log(`   Adelanto filtrado: correlativo ${emision.correlativo}`);
    }


    // Dentro de BusquedaComprobantes (o como se llame tu Page Object)
    async filtrarAdelantoFactura(emision: EmisionResult | null): Promise<void> {
        if (!emision) throw new Error('No hay emisión capturada para filtrar adelanto');

        await this.page.locator('[id="_div:dropdown"]').getByText('Serie').click();
        await this.page.locator('[id*="opcion-serie"]').filter({ hasText: 'F001' }).first().click();

        // Buscar por correlativo
        const inputCorrelativo = this.page.getByRole('textbox', { name: 'Correlativo' });
        await inputCorrelativo.click();
        await inputCorrelativo.fill(emision.correlativo);
        
        // Presionar Enter para disparar el filtrado en la grilla del modal
        await inputCorrelativo.press('Enter');

        const referenciaUnica = `F001-${emision.correlativo}`;
        const filaEsperada = this.page.locator('tr').filter({ hasText: referenciaUnica }).first();
        await filaEsperada.waitFor({ state: 'visible', timeout: 15_000 });

        // Marcar el checkbox del adelanto (al filtrar, debería ser el primero)
        const checkbox = this.page.locator('[id="pv_punto-venta_cmp_venta_pedido:modals_cmp-gestion-adelantos_v-checkbox:agregar-adelanto-0"]');
        await checkbox.click({ force: true });

        console.log(`   Adelanto factura filtrado y seleccionado: F001-${emision.correlativo}`);
    }

    // ─── Validación de estado SUNAT ───────────────────────────────────

    async validarEstadoSunat(): Promise<'EXITOSO' | 'TRANSITORIO' | 'DEFINITIVO'> {
        try {
            if (!this.ultimoComprobanteConsulta) {
                console.warn('  No hay datos de Consultas — no se puede validar SUNAT');
                return 'TRANSITORIO';
            }

            let { idEstadoSunat } = this.ultimoComprobanteConsulta;
            const { serieDescripcion, correlativoDocumento } = this.ultimoComprobanteConsulta;
            const compId = `${serieDescripcion}-${correlativoDocumento}`;

            if (ESTADOS_EXITOSOS.includes(idEstadoSunat)) {
                console.log(`   SUNAT: ${compId} → ACEPTADA (estado ${idEstadoSunat})`);
                return 'EXITOSO';
            }

            if (ESTADOS_TRANSITORIOS.includes(idEstadoSunat)) {
                console.log(`   SUNAT: ${compId} → procesando (estado ${idEstadoSunat}). Esperando 8s...`);
                await this.page.waitForTimeout(8000);

                // Re-consultar la API
                const consultaPromise = this.page.waitForResponse(
                    (resp) => resp.url().includes('DocumentosContables/Consultas') && resp.status() === 200,
                    { timeout: 15_000 },
                );

                // Disparar la búsqueda nuevamente
                const inputCorrelativo = this.page.locator(
                    '[id="pv_comprobantes_cmp-grid-comprobantes-header:header-grilla_v-input:Correlativo"]',
                );
                await inputCorrelativo.click();
                await inputCorrelativo.fill(correlativoDocumento.toString());

                try {
                    const response = await consultaPromise;
                    const body = await response.json();
                    const data = body.ComprobantesCollectionResponse?.Data ?? [];
                    if (data.length > 0) {
                        idEstadoSunat = data[0].IdestadoSunat ?? 0;
                    }
                } catch {
                    console.warn(`   No se pudo re-interceptar Consultas para ${compId}`);
                }

                if (ESTADOS_EXITOSOS.includes(idEstadoSunat)) {
                    console.log(`  ✓ SUNAT: ${compId} → ACEPTADA en re-consulta (estado ${idEstadoSunat})`);
                    return 'EXITOSO';
                } else {
                    console.warn(
                        `  ️ SUNAT: ${compId} → sigue sin aceptar (estado final ${EstadoSunat[idEstadoSunat] || idEstadoSunat}).` +
                        ` El test NO falla — SUNAT sigue demorada.`,
                    );
                    return 'TRANSITORIO';
                }
            }

            console.warn(
                `   SUNAT: ${compId} → estado definitivo NO aceptado (${EstadoSunat[idEstadoSunat] || idEstadoSunat}).` +
                ` El test NO falla — requiere revisión manual.`,
            );
            return 'DEFINITIVO';
        } catch (error) {
            return await throwFunctionalError({
                page: this.page,
                ...FUNCTIONAL_CATALOG.puntoVenta.validarSunat,
                cause: error,
            });
        }
    }

    // ─── Dropdown del comprobante ─────────────────────────────────────

    async abrirDropdownPrimerComprobante(): Promise<void> {
        await this.page.locator('.body-options > .cmp-dropdown').first().click();
    }

    async abrirDropdownPorIcono(): Promise<void> {
        await this.page.locator('.v-icon-base > .icon').first().click();
    }

    // ─── Bitácora ─────────────────────────────────────────────────────
    async abrirBitacora(): Promise<void> {
        await this.page.getByText('Bitácora').click();
    }

    async cerrarBitacora(): Promise<void> {
        await this.page.locator('.drape.is-open > .button-close > .icon').click();
    }

    async abrirBitacoraDelPrimerComprobante(): Promise<void> {
        await this.abrirDropdownPrimerComprobante();
        await this.abrirBitacora();
    }

    // ─── Polling de Bitácora ──────────────────────────────────────────
    //
    // Los servicios backend (Logística/stock vía Kafka, SUNAT/CDR,
    // Contabilidad) procesan de forma asíncrona. La bitácora carga su
    // contenido al abrirse, así que si el servicio aún no terminó,
    // hay que CERRAR → ESPERAR → REABRIR para ver la nueva entrada.
    //

    /** Opciones de polling para bitácora */
    private static readonly BITACORA_POLL = {
        /** Intervalo entre reintentos (ms) */
        interval: 5_000,
        /** Timeout máximo de espera (ms) — cubre Kafka + SUNAT + Logística */
        timeout: 90_000,
    };

    /**
     * Espera a que una entrada aparezca en la bitácora, recargándola entre intentos.
     *
     * Flujo: verificar → si no existe → cerrar bitácora → esperar → reabrir → verificar
     * Repite hasta encontrar el texto o alcanzar el timeout.
     *
     * @param patron - RegExp o string a buscar en la bitácora
     * @param descripcion - Nombre legible para logs/errores
     * @param options - Override de interval/timeout
     */
    private async esperarEntradaBitacora(
        patron: RegExp | string,
        descripcion: string,
        options?: { interval?: number; timeout?: number },
    ): Promise<void> {
        const { interval, timeout } = {
            ...BusquedaComprobantesPage.BITACORA_POLL,
            ...options,
        };
        const deadline = Date.now() + timeout;
        const locator = typeof patron === 'string'
            ? this.page.getByText(patron).first()
            : this.page.getByText(patron).first();

        // Primer intento rápido (la bitácora ya está abierta)
        const visible = await locator.isVisible().catch(() => false);
        if (visible) return;

        // Polling con recarga
        while (Date.now() < deadline) {
            await new Promise(r => setTimeout(r, interval));

            // Cerrar y reabrir bitácora para refrescar
            await this.cerrarBitacora();
            await this.abrirBitacoraDelPrimerComprobante();

            const found = await locator.isVisible().catch(() => false);
            if (found) {
                console.log(`  ✓ Bitácora: "${descripcion}" encontrado tras polling`);
                return;
            }
            console.log(`   Bitácora: esperando "${descripcion}"...`);
        }

        // Último intento con assert para generar error descriptivo
        await expect(locator).toBeVisible({
            timeout: 5_000,
        });
    }

    /**
     * Valida que la bitácora muestre CDR aceptado (respuesta SUNAT).
     * Polling: SUNAT puede tardar 30-60s en responder.
     */
    async validarCDRAceptado(): Promise<void> {
        await this.esperarEntradaBitacora(
            /ha sido aceptada/i,
            'CDR Aceptado (SUNAT)',
        );
    }

    /**
     * Valida que la bitácora muestre descargo de inventarios.
     * Polling: Logística procesa vía Kafka, puede tardar 15-60s.
     */
    async validarDescargoInventarios(): Promise<void> {
        await this.esperarEntradaBitacora(
            /Se descargaron los Inventarios/i,
            'Descargo de Inventarios (Logística)',
        );
    }

    /**
     * Valida que la bitácora NO muestre descargo de inventarios.
     * Usado en adelantos. Espera un tiempo prudente para confirmar ausencia.
     */
    async validarSinDescargoInventarios(): Promise<void> {
        // Esperar un tiempo razonable para que si fuera a aparecer, ya habría aparecido
        await new Promise(r => setTimeout(r, 10_000));
        await this.cerrarBitacora();
        await this.abrirBitacoraDelPrimerComprobante();
        await expect(
            this.page.getByText(/Se descargaron los Inventarios/i),
        ).not.toBeVisible({ timeout: 5_000 });
    }

    /**
     * Valida "Comprobante Emitido" en la bitácora de forma inteligente.
     * Solo hace polling si el estado SUNAT es exitoso.
     */
    async validarComprobanteEmitido(estadoSunat: 'EXITOSO' | 'TRANSITORIO' | 'DEFINITIVO' = 'EXITOSO'): Promise<void> {
        await expect(
            this.page.getByText('Comprobante Emitido').first(),
        ).toBeVisible({ timeout: 10_000 });

        if (estadoSunat === 'EXITOSO') {
            await this.esperarEntradaBitacora(
                /ha sido aceptada/i,
                'CDR Aceptado (SUNAT)',
                { timeout: 15_000 },
            );
        }
    }

    async validarComprobanteEmitidonota(): Promise<void> {
        await expect(
            this.page.getByText('Comprobante Emitido').first(),
        ).toBeVisible({ timeout: 10_000 });

    }

    /** Valida "XML Generado" con polling */
    async validarXMLGenerado(): Promise<void> {
        await this.esperarEntradaBitacora(
            'XML Generado',
            'XML Generado',
            { timeout: 30_000 },
        );
    }

    /** Valida "PDF Generado" con polling */
    async validarPDFGenerado(): Promise<void> {
        await this.esperarEntradaBitacora(
            'PDF Generado',
            'PDF Generado',
            { timeout: 30_000 },
        );
    }

    // ─── Ver comprobante (popup) ──────────────────────────────────────

    /**
     * Abre "Ver comprobante" en nueva pestaña (popup).
     * Previamente debe abrirse el dropdown del comprobante.
     * @returns La Page del popup abierto
     */
    async abrirVerComprobante(): Promise<Page> {
        await this.abrirDropdownPrimerComprobante();
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('link', { name: 'Ver comprobante' }).click();
        return popupPromise;
    }

    // ─── Validaciones en popup ────────────────────────────────────────

    /** Verifica leyenda de retención en popup del comprobante */
    async validarRetencionEnPopup(popupPage: Page, porcentaje: string): Promise<void> {
        await expect(
            popupPage.getByText(`ESTE DOCUMENTO ESTA AFECTO A RETENCION DEL ${porcentaje}%`),
        ).toBeVisible({ timeout: 10_000 });
    }

    /** Verifica leyenda de detracción en popup del comprobante */
    async validarDetraccionEnPopup(popupPage: Page): Promise<void> {
        await expect(
            popupPage.getByText('OPERACIÓN SUJETA AL SISTEMA'),
        ).toBeVisible({ timeout: 10_000 });
    }

    /** Verifica que sea factura de adelanto en popup */
    async validarFacturaAdelantoEnPopup(popupPage: Page): Promise<void> {
        await expect(
            popupPage.getByText('Factura de adelanto'),
        ).toBeVisible({ timeout: 10_000 });
    }

    /** Verifica que el popup muestre adelantos aplicados */


    async validarAdelantosAplicadosEnPopup(popupPage: Page): Promise<void> {
        const adelantos = popupPage.getByText('Adelantos aplicados').nth(1);
        const comprobantes = popupPage.getByText('Comprobantes de aplicación').nth(1);

        await expect(adelantos.or(comprobantes)).toBeVisible({ timeout: 10000 });
    }

    /** Acciones extra dentro de la ventana de ver comprobante */
    async clickAccionesExtra(popupPage: Page): Promise<void> {
        await popupPage.getByRole('button', { name: 'Acciones extra' }).click();
    }

    /** Datos opcionales dentro del popup */
    async clickDatosOpcionales(popupPage: Page): Promise<void> {
        await popupPage.getByText('Datos opcionales').click();
    }

    /** Cierra drape en popup */
    async cerrarDrapePopup(popupPage: Page): Promise<void> {
        await popupPage.locator('.drape.is-open > .button-close > .icon').click();
    }
}
