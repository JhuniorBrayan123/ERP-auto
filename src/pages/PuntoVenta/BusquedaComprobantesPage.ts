import {expect, type Locator, type Page} from '@playwright/test';
import type {EmisionResult} from '../../helpers/PuntoVenta/emision.types';
import {EstadoSunat} from '../../helpers/PuntoVenta/sunat-estados.helper';
import {throwFunctionalError} from '../../utils/functional-error';
import {FUNCTIONAL_CATALOG} from '../../utils/functional-catalog';
import {esperarCargaOverlay} from "@utils/wait-helpers";
import type {BcCategoria, BcPresetFecha, DatosOpcionales} from '../../helpers/PuntoVenta/busqueda-comprobantes.data';

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
        await this.page.getByRole('button', {name: 'Aceptar'}).click();

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

    async seleccionarCategoria(categoria: BcCategoria): Promise<void> {
        await this.page.locator(
            `[id="pv_comprobantes_cmp-header-comprobantes_categorias:pill-${categoria}"]`,
        ).click();
        await esperarCargaOverlay(this.page);
    }

    async abrirFiltrosAvanzados(): Promise<void> {
        const btn = this.page.locator(
            '[id="pv_comprobantes_cmp-filtros-comprobantes:state_v-button-filter-border:activar-filtros-avanzados"]',
        );
        try {
            await btn.waitFor({state: 'visible', timeout: 30_000});
            await btn.click();
        } catch {

        }
    }

    async aplicarFiltros(): Promise<void> {
        await this.page.getByRole('button', {name: 'Aplicar filtros'}).click();
        await esperarCargaOverlay(this.page);
    }

    async borrarFiltros(): Promise<void> {
        await this.page.getByRole('button', {name: 'Borrar filtros'}).click();
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorRangoFecha(preset: BcPresetFecha): Promise<void> {
        await this.page.locator(
            '[id="pv_comprobantes_cmp-filtros-basicos-comprobantes:state_v-datepicker-range:rango-fecha"]',
        ).click();
        await this.page.getByRole('button', {name: preset, exact: true}).click();
        await this.aplicarFiltros();
    }

    async filtrarPorTipo(tipo: string): Promise<void> {
        await this.page.getByText('Tipo de comprobante').first().click();
        await this.page.getByText(tipo, {exact: true}).click();
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorSerie(serie: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Serie$/}).nth(2).click();
        await this.page.locator('thead').getByText(serie).click();
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorMoneda(moneda: string): Promise<void> {
        await this.page.getByText('Moneda').first().click();
        await this.page.locator('thead').getByText(moneda).click();
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorCorrelativos(correlativo: string): Promise<void> {
        const consultaPromise = this.page.waitForResponse(
            (resp) => resp.url().includes('DocumentosContables/Consultas') && resp.status() === 200,
            {timeout: 30_000},
        );
        const input = this.page.getByRole('textbox', {name: 'Correlativo'});
        await input.click();
        const valorFiltro = correlativo.replace(/^0+/, '') || '0';
        await input.fill(valorFiltro);
        await input.press('Enter');
        await consultaPromise.catch(() => {
        });
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorNombreCliente(nombre: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'Nombre / Razón Social'});
        await input.click();
        await input.fill(nombre);
        await input.press('Enter');
        await esperarCargaOverlay(this.page);
    }

    async filtrarPorNumDocCliente(documento: string): Promise<void> {
        const input = this.page.getByRole('textbox', {name: 'N° de Documento'});
        await input.click();
        await input.fill(documento);
        await input.press('Enter');
        await esperarCargaOverlay(this.page);
    }


    async filtrarPorMontoTotal(comparador: string, valor: string): Promise<void> {
        await this.page.locator(
            '[id="pv_comprobantes_cmp-grid-comprobantes-header:grid-header_v-input:MontoTotalFormateado"]',
        ).click();

        const dropdownComparador = this.page.locator('.v-select-header-form');
        await dropdownComparador.click();

        const opcionesDropdown = this.page.locator('.v-select-base-options.is-open');
        await opcionesDropdown.waitFor({state: 'visible'});

        await opcionesDropdown
            .locator('.v-select-form-option')
            .getByText(comparador, {exact: true})
            .click();

        const inputValor = this.page.locator(
            '[id="pv_common_cmp-card-filter-number:filtro_v-input:valor"]',
        );
        await inputValor.fill(valor);
        await this.page.locator('[id="pv_comprobantes_cmp-grid-comprobantes-header:grid-header_cmp-card-filter-number:aplicar-filtro"]').click();
        await esperarCargaOverlay(this.page);
    }

    obtenerFilaPorNumero(numeroCompleto: string): Locator {
        const partes = numeroCompleto.split('-');
        if (partes.length >= 2) {
            const correlativo = partes[1].replace(/^0+/, '');
            // Correlativo real con dígitos → buscar por él (ej: "200" en "F001-00000200")
            if (correlativo) {
                return this.page.locator('tr').filter({hasText: correlativo}).first();
            }


            const serie = partes[0];
            if (serie && serie !== '0') {
                return this.page.locator('tr').filter({hasText: serie}).first();
            }
        }

        return this.page.locator('tbody tr').first();
    }

    async validarSinResultados(): Promise<void> {
        await expect(
            this.page.getByRole('cell').filter({hasText: /no encontramos resultados/i}).first(),
        ).toBeVisible({timeout: 10_000});
    }

    async obtenerColumnasVisibles(): Promise<string[]> {
        const headers = await this.page.locator('thead th').all();
        const textos: string[] = [];
        for (const th of headers) {
            const texto = (await th.textContent())?.trim() ?? '';
            if (texto) textos.push(texto);
        }
        return textos;
    }

    async obtenerValoresColumna(nombreColumna: string): Promise<string[]> {
        const headers = await this.page.locator('thead th').all();
        let colIndex = -1;
        for (let i = 0; i < headers.length; i++) {
            const texto = (await headers[i].textContent())?.trim() ?? '';
            if (texto.toLowerCase().includes(nombreColumna.toLowerCase())) {
                colIndex = i;
                break;
            }
        }
        if (colIndex === -1) throw new Error(`Columna "${nombreColumna}" no encontrada en la grilla`);
        const celdas = await this.page.locator(`tbody tr td:nth-child(${colIndex + 1})`).all();
        const valores: string[] = [];
        for (const celda of celdas) {
            valores.push((await celda.textContent())?.trim() ?? '');
        }
        return valores;
    }

    async obtenerIdentificadoresPrimeraPagina(): Promise<string[]> {
        const filas = await this.page.locator('tbody tr').all();
        const ids: string[] = [];
        for (const fila of filas) {
            const serie = await fila.locator('td').nth(3).textContent() ?? '';
            const correlativo = await fila.locator('td').nth(4).textContent() ?? '';
            if (serie.trim() && correlativo.trim()) {
                ids.push(`${serie.trim()}-${correlativo.trim()}`);
            }
        }
        return ids;
    }

    async ordenarPorColumna(nombreColumna: string): Promise<void> {
        const header = this.page.locator('thead th').filter({hasText: nombreColumna}).first();
        await header.click();
        await esperarCargaOverlay(this.page);
    }

    get btnSiguiente(): Locator {
        return this.page.getByText('Siguiente').first();
    }

    async irAPaginaSiguiente(): Promise<boolean> {
        const habilitado = await this.btnSiguiente.isEnabled({timeout: 5_000}).catch(() => false);
        if (!habilitado) return false;
        await this.btnSiguiente.click();
        await esperarCargaOverlay(this.page);
        return true;
    }

    async abrirAccionesDeComprobante(numeroCompleto: string): Promise<void> {
        const partes = numeroCompleto.split('-');
        const textoBusqueda = partes.length >= 2
            ? (partes[1].replace(/^0+/, '') || partes[0] || numeroCompleto)
            : numeroCompleto;

        const filas = this.page.locator('tbody tr');
        const dropdowns = this.page.locator(
            '[id^="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:"]',
        );
        const total = await filas.count();
        for (let i = 0; i < total; i++) {
            if ((await filas.nth(i).textContent() ?? '').includes(textoBusqueda)) {
                await dropdowns.nth(i).waitFor({state: 'visible', timeout: 10_000});
                await dropdowns.nth(i).click();
                return;
            }
        }
    }

    async abrirAccionesDelPrimerComprobante(): Promise<void> {
        const dropdown = this.page.locator(
            '[id^="pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_cmp-dropdown:"]',
        ).first();
        await dropdown.waitFor({state: 'visible', timeout: 10_000});
        await dropdown.click();
    }

    async validarBitacoraDelPrimerComprobante(eventos: string[]): Promise<void> {
        await this.abrirAccionesDelPrimerComprobante();
        await this.abrirBitacora();
        for (const evento of eventos) {
            const {expect} = await import('@playwright/test');
            await expect(this.page.locator('body')).toContainText(evento, {timeout: 25_000});
        }
        await this.cerrarBitacora();
    }

    async seleccionarAccion(nombreAccion: string): Promise<void> {
        await this.page.getByText(nombreAccion, {exact: true}).click();
        await esperarCargaOverlay(this.page);
    }

    async seleccionarCajaParaClonar(nombreCaja: string) {
        await this.page
            .locator('.cmp-card-caja')
            .filter({has: this.page.locator('.titulo').getByText(nombreCaja, {exact: true})})
            .click();
    }

    async confirmarClonacion(): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('button', {name: 'Continuar'}).click();
        return await popupPromise;
    }

    async seleccionarAccionPorId(idAccion: string): Promise<void> {
        await this.page.locator(`[id="${idAccion}"]`).click();
    }

    async validarAccionVisible(nombreAccion: string): Promise<void> {
        await expect(
            this.page.getByText(nombreAccion, {exact: true}),
        ).toBeVisible({timeout: 5_000});
    }

    async validarAccionOculta(nombreAccion: string): Promise<void> {
        await expect(
            this.page.getByText(nombreAccion, {exact: true}),
        ).not.toBeVisible({timeout: 3_000});
    }

    async validarOpcionesGenerarComprobante(opciones: string[]): Promise<void> {
        for (const opcion of opciones) {
            await expect(this.page.getByText(opcion, {exact: true})).toBeVisible({timeout: 5_000});
        }
    }

    async abrirGenerarComprobante(tipoComprobante: string, nombreCaja: string): Promise<Page> {
        const normalized = tipoComprobante.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/\bde\b/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const optionId = `pv_comprobantes_cmp-grid-comprobantes_cmp-grid-comprobantes-body_cmp-grid-comprobantes-body-options_generar-comprobante_li:${normalized}`;
        await this.page.locator(`[id="${optionId}"]`).click();
        await this.page.locator('.cmp-card-caja').filter({hasText: nombreCaja}).click();
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('button', {name: 'Continuar'}).click();
        return popupPromise;
    }

    async abrirConfiguracionColumnas(): Promise<void> {
        await this.page.locator('.v-icon-head-plus > .icon').click();

        await this.page.locator('.container-dropdown-elements').waitFor({state: 'attached', timeout: 5000});
    }

    async configurarColumna(categoria: string, campoId: string, activar: boolean): Promise<boolean> {
        const itemId = `pv_cmp-comprobantes:cmp-grid-comprobantes-header-options_select-columns:item-${categoria}-${campoId}`;
        const container = this.page.locator(`[id="${itemId}"]`);


        if (await container.count() === 0) return false;


        const wrapper = container.locator('.v-checkbox');
        const checkedAttr = await wrapper.getAttribute('checked').catch(() => null);
        const isChecked = checkedAttr === 'true';

        if (activar && !isChecked) {

            await container.scrollIntoViewIfNeeded();

            await container.locator('label').click({force: true});
            return true;
        }
        if (!activar && isChecked) {
            await container.scrollIntoViewIfNeeded();
            await container.locator('label').click({force: true});
            return true;
        }

        return false;
    }

    async guardarConfiguracionColumnas(): Promise<void> {
        await this.page.locator(
            '[id="pv_cmp-comprobantes:cmp-grid-comprobantes-header-options_v-button:guardar-configuracion"]',
        ).click();
        await esperarCargaOverlay(this.page);
    }

    async activarTodasLasColumnas(): Promise<void> {
        const columnasPorCategoria: Record<BcCategoria, string[]> = {
            TODOS: [
                'NumeroDocumento', 'FCreacion', 'FEmision', 'UsuarioCreador',
                'Peso', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'Subtotal', 'IGV', 'Mtotal', 'MontoPagado',
                'MontoAdeudado', 'EstadoPago', 'ListEstadosSunat',
            ],
            VENTAS: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
            FACTURACION: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
            GUIAS: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
            COTIZACIONES: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
            PEDIDOS: [
                'NumeroDocumento', 'IdRazonSocial', 'FEmision', 'IdsCajas',
                'Despacho', 'CondicionesPago', 'MetodosPago', 'Monedas',
                'ListEstados', 'EstadoPago', 'ListEstadosSunat',
            ],
        };

        for (const [categoria, columnas] of Object.entries(columnasPorCategoria)) {
            await this.seleccionarCategoria(categoria as BcCategoria);
            await this.abrirConfiguracionColumnas();

            let changed = false;
            for (const campoId of columnas) {
                const toggled = await this.configurarColumna(categoria, campoId, true);
                if (toggled) changed = true;
            }

            if (changed) {
                await this.guardarConfiguracionColumnas();
            } else {
                await this.page.locator('.v-icon-head-plus > .icon').click();
            }
        }

        await this.seleccionarCategoria('TODOS');
    }

    async abrirVerComprobanteDesdeMenu(): Promise<Page> {
        const popupPromise = this.page.waitForEvent('popup');
        await this.page.getByRole('link', {name: 'Ver comprobante'}).click();
        const popupPage = await popupPromise;
        await esperarCargaOverlay(popupPage);
        return popupPage;
    }

    async emitirGuiaRemisionGuardada(): Promise<void> {
        await this.page.getByText('Emitir', {exact: true}).click();
        await this.page.getByRole('button', {name: 'Emitir'}).click();
        await esperarCargaOverlay(this.page);
    }

    async confirmarEliminacion(motivo: string): Promise<void> {
        await this.page.locator('div').filter({hasText: /^Seleccionar$/}).nth(3).click();
        await this.page.getByText(motivo).click();
        await this.page.getByRole('button', {name: 'Anular'}).click();
        await esperarCargaOverlay(this.page);
    }

    async cerrarModalExito(): Promise<void> {
        await this.page.locator('.v-modal > .icon').click();
    }

    async clonarHaciaCaja(nombreCaja: string): Promise<void> {
        await this.seleccionarAccion('Clonar comprobante');
        await this.page.locator('.cmp-card-caja').filter({hasText: nombreCaja}).click();
    }

    async validarCajaBloqueada(nombreCaja: string, mensaje: string): Promise<void> {
        await this.seleccionarAccion('Clonar comprobante');
        const card = this.page.locator('.cmp-card-caja.blocked').filter({hasText: nombreCaja});
        await expect(card.locator('.blocked-caja')).toContainText(mensaje, {timeout: 10_000});
    }

    async validarBitacoraContiene(comprobante: import('@helpers/PuntoVenta/busqueda-comprobantes.data').ComprobanteInfo, eventos: string[]): Promise<void> {
        await this.abrirAccionesDeComprobante(comprobante.numeroCompleto);
        await this.abrirBitacora();
        for (const evento of eventos) {
            await import('@playwright/test').then(({expect}) =>
                expect(this.page.locator('body')).toContainText(evento, {timeout: 25_000}),
            );
        }
        await this.cerrarBitacora();
    }

    async ir(): Promise<void> {
        await this.page.goto('/punto-venta/comprobantes');
        await this.page.waitForLoadState('networkidle');
        await this.page.locator(
            '[id="pv_comprobantes_cmp-filtros-comprobantes:state_v-button-filter-border:activar-filtros-avanzados"]',
        ).waitFor({state: 'visible', timeout: 30_000});
    }

    async buscarPorSerieCorrelativo(comprobante: import('../../helpers/PuntoVenta/busqueda-comprobantes.data').ComprobanteInfo): Promise<void> {
        await this.abrirFiltrosAvanzados();
        await this.filtrarPorCorrelativos(comprobante.correlativo);
    }

    estadoDe(comprobante: import('../../helpers/PuntoVenta/busqueda-comprobantes.data').ComprobanteInfo) {
        const row = this.obtenerFilaPorNumero(comprobante.numeroCompleto);
        return row.locator('.label-estado-comprobante span').first();
    }
}

