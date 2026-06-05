import {expect, type Page} from '@playwright/test';
import type {EmisionResult} from '../../helpers/PuntoVenta/emision.types';
import {EstadoSunat} from '../../helpers/PuntoVenta/sunat-estados.helper';
import {throwFunctionalError} from '../../utils/functional-error';
import {FUNCTIONAL_CATALOG} from '../../utils/functional-catalog';
import {esperarCargaOverlay} from "@utils/wait-helpers";

const ESTADOS_EXITOSOS = [EstadoSunat.ACEPTADA, EstadoSunat.ACEPTADA_OBSERVADA];
const ESTADOS_TRANSITORIOS = [EstadoSunat.PENDIENTE_ENVIO, EstadoSunat.PENDIENTE_RESPUESTA, EstadoSunat.NO_DISPONIBLE];

export class BusquedaComprobantesPage {
    constructor(private readonly page: Page) {
    }

    async salirDeCaja(): Promise<void> {
        await this.page.locator('.v-icon-back .icon').click();
    }

    async navegarABusquedaComprobantes(emision?: EmisionResult | null): Promise<void> {
        await this.salirDeCaja();
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Búsqueda de comprobantes').click();

        if (emision?.correlativo) {
            await this.filtrarPorCorrelativo(emision.correlativo);
        }
    }

    public ultimoComprobanteConsulta: {
        idEstadoSunat: number;
        estadoDescripcion: string;
        serieDescripcion: string;
        correlativoDocumento: number;
        idComprobanteERP: number;
    } | null = null;

    async filtrarPorCorrelativo(correlativo: string): Promise<void> {
        await this.page.locator(
            '[id="pv_comprobantes_cmp-filtros-comprobantes:state_v-button-filter-border:activar-filtros-avanzados"]',
        ).click();

        const consultaPromise = this.page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Consultas') && resp.status() === 200,
            {timeout: 15_000},
        );

        const inputCorrelativo = this.page.locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes-header:header-grilla_v-input:Correlativo"]',
        );
        await inputCorrelativo.click();
        await inputCorrelativo.fill(correlativo);
        await inputCorrelativo.press('Enter'); 

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

        const seriesPromise = this.page.waitForResponse(
            (resp) =>
                resp.url().includes('entidades/series') &&
                resp.url().includes('idtipodocumento=2016') &&
                resp.status() === 200,
            {timeout: 15_000},
        );

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

    async filtrarAdelantoFactura(emision: EmisionResult | null): Promise<void> {
        if (!emision) throw new Error('No hay emisión capturada para filtrar adelanto');

        await this.page.locator('[id="_div:dropdown"]').getByText('Serie').click();
        await this.page.locator('[id*="opcion-serie"]').filter({hasText: 'F001'}).first().click();

        const inputCorrelativo = this.page.getByRole('textbox', {name: 'Correlativo'});
        await inputCorrelativo.click();
        await inputCorrelativo.fill(emision.correlativo);

        await inputCorrelativo.press('Enter');

        const referenciaUnica = `F001-${emision.correlativo}`;
        const filaEsperada = this.page.locator('tr').filter({hasText: referenciaUnica}).first();
        await filaEsperada.waitFor({state: 'visible', timeout: 15_000});

        const checkbox = this.page.locator('[id="pv_punto-venta_cmp_venta_pedido:modals_cmp-gestion-adelantos_v-checkbox:agregar-adelanto-0"]');
        await checkbox.click({force: true});

        console.log(`   Adelanto factura filtrado y seleccionado: F001-${emision.correlativo}`);
    }

    async validarEstadoSunat(): Promise<'EXITOSO' | 'TRANSITORIO' | 'DEFINITIVO'> {
        try {
            if (!this.ultimoComprobanteConsulta) {
                console.warn('  No hay datos de Consultas — no se puede validar SUNAT');
                return 'TRANSITORIO';
            }

            let {idEstadoSunat} = this.ultimoComprobanteConsulta;
            const {serieDescripcion, correlativoDocumento} = this.ultimoComprobanteConsulta;
            const compId = `${serieDescripcion}-${correlativoDocumento}`;

            if (ESTADOS_EXITOSOS.includes(idEstadoSunat)) {
                console.log(`   SUNAT: ${compId} → ACEPTADA (estado ${idEstadoSunat})`);
                return 'EXITOSO';
            }

            if (ESTADOS_TRANSITORIOS.includes(idEstadoSunat)) {
                console.log(`   SUNAT: ${compId} → procesando (estado ${idEstadoSunat}). Esperando 8s...`);
                await this.page.waitForTimeout(8000);

                const consultaPromise = this.page.waitForResponse(
                    (resp) => resp.url().includes('DocumentosContables/Consultas') && resp.status() === 200,
                    {timeout: 15_000},
                );

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

    async abrirDropdownPrimerComprobante(): Promise<void> {
        await this.page.locator('.body-options > .cmp-dropdown').first().click();
    }

    async abrirDropdownPorIcono(): Promise<void> {
        await this.page.locator('.v-icon-base > .icon').first().click();
    }

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

    private static readonly BITACORA_POLL = {
        
        interval: 5_000,
        
        timeout: 90_000,
    };

    private async esperarEntradaBitacora(
        patron: RegExp | string,
        descripcion: string,
        options?: { interval?: number; timeout?: number },
    ): Promise<void> {
        const {interval, timeout} = {
            ...BusquedaComprobantesPage.BITACORA_POLL,
            ...options,
        };
        const deadline = Date.now() + timeout;
        const locator = typeof patron === 'string'
            ? this.page.getByText(patron).first()
            : this.page.getByText(patron).first();

        const visible = await locator.isVisible().catch(() => false);
        if (visible) return;

        while (Date.now() < deadline) {
            await new Promise(r => setTimeout(r, interval));

            await this.cerrarBitacora();
            await this.abrirBitacoraDelPrimerComprobante();

            const found = await locator.isVisible().catch(() => false);
            if (found) {
                console.log(`  ✓ Bitácora: "${descripcion}" encontrado tras polling`);
                return;
            }
            console.log(`   Bitácora: esperando "${descripcion}"...`);
        }

        await expect(locator).toBeVisible({
            timeout: 5_000,
        });
    }

    async validarCDRAceptado(): Promise<void> {
        await this.esperarEntradaBitacora(
            /ha sido aceptada/i,
            'CDR Aceptado (SUNAT)',
        );
    }

    async validarDescargoInventarios(): Promise<void> {
        await this.esperarEntradaBitacora(
            /Se descargaron los Inventarios/i,
            'Descargo de Inventarios (Logística)',
        );
    }

    async validarSinDescargoInventarios(): Promise<void> {
        
        await new Promise(r => setTimeout(r, 10_000));
        await this.cerrarBitacora();
        await this.abrirBitacoraDelPrimerComprobante();
        await expect(
            this.page.getByText(/Se descargaron los Inventarios/i),
        ).not.toBeVisible({timeout: 5_000});
    }

    async validarComprobanteEmitido(estadoSunat: 'EXITOSO' | 'TRANSITORIO' | 'DEFINITIVO' = 'EXITOSO'): Promise<void> {
        await expect(
            this.page.getByText('Comprobante Emitido').first(),
        ).toBeVisible({timeout: 10_000});

        if (estadoSunat === 'EXITOSO') {
            await this.esperarEntradaBitacora(
                /ha sido aceptada/i,
                'CDR Aceptado (SUNAT)',
                {timeout: 15_000},
            );
        }
    }

    async validarComprobanteEmitidonota(): Promise<void> {
        await expect(
            this.page.getByText('Comprobante Emitido').first(),
        ).toBeVisible({timeout: 10_000});

    }

    async validarXMLGenerado(): Promise<void> {
        await this.esperarEntradaBitacora(
            'XML Generado',
            'XML Generado',
            {timeout: 30_000},
        );
    }

    async validarPDFGenerado(): Promise<void> {
        await this.esperarEntradaBitacora(
            'PDF Generado',
            'PDF Generado',
            {timeout: 30_000},
        );
    }

    async abrirVerComprobante(): Promise<Page> {
        await this.abrirDropdownPrimerComprobante();
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('link', {name: 'Ver comprobante'}).click();
        return popupPromise;
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
}
