import {type Page} from '@playwright/test';
import type {EmisionResult} from '@helpers/PuntoVenta/emision.types';
import type {
    BcCategoria,
    BcPresetFecha,
    ComprobanteInfo,
    DatosOpcionales
} from '@helpers/PuntoVenta/busqueda-comprobantes.data';

import {ComprobantesFiltrosComponent} from './components/ComprobantesFiltrosComponent';
import {ComprobantesGridComponent} from './components/ComprobantesGridComponent';
import {ComprobantesAccionesComponent} from './components/ComprobantesAccionesComponent';
import {ComprobantesBitacoraComponent} from './components/ComprobantesBitacoraComponent';
import {ConfiguracionColumnasComponent} from './components/ConfiguracionColumnasComponent';
import {AdelantosModalComponent} from './components/AdelantosModalComponent';
import {VerComprobantePopupPage} from './popups/VerComprobantePopupPage';
import {SunatConsultaService} from './services/SunatConsultaService';

export class BusquedaComprobantesPage {
    readonly filtros: ComprobantesFiltrosComponent;
    readonly grid: ComprobantesGridComponent;
    readonly acciones: ComprobantesAccionesComponent;
    readonly bitacora: ComprobantesBitacoraComponent;
    readonly columnas: ConfiguracionColumnasComponent;
    readonly adelantos: AdelantosModalComponent;
    readonly verComprobante: VerComprobantePopupPage;
    readonly sunat: SunatConsultaService;

    constructor(private readonly page: Page) {
        this.filtros = new ComprobantesFiltrosComponent(page);
        this.grid = new ComprobantesGridComponent(page);
        this.acciones = new ComprobantesAccionesComponent(page);
        this.bitacora = new ComprobantesBitacoraComponent(page);
        this.columnas = new ConfiguracionColumnasComponent(page);
        this.adelantos = new AdelantosModalComponent(page);
        this.verComprobante = new VerComprobantePopupPage(page);
        this.sunat = new SunatConsultaService(page);
    }


    async salirDeCaja(): Promise<void> {
        await this.page.locator('.v-icon-back .icon').click();
    }

    private async esperarOverlayOculto(): Promise<void> {
        const overload = this.page.locator('[id="cmn_cmp-overload:loading"]');
        await overload.waitFor({ state: 'visible', timeout: 3_000 }).catch(() => {});
        await overload.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
    }

    async navegarABusquedaComprobantes(emision?: EmisionResult | null): Promise<void> {
        await this.salirDeCaja();
        await this.esperarOverlayOculto();
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Búsqueda de comprobantes').click();

        if (emision?.correlativo) {
            await this.filtros.filtrarPorCorrelativo(emision.correlativo);
        }
    }


    async navegarABusquedaComprobantesConSunat(emision: EmisionResult): Promise<void> {
        await this.salirDeCaja();
        await this.esperarOverlayOculto();
        await this.page.getByText('Ventas y compras').click();
        await this.page.getByText('Búsqueda de comprobantes').click();
        await this.filtros.abrirFiltrosAvanzados();
        await this.sunat.consultarPorCorrelativo(emision.correlativo);
    }

    async ir(): Promise<void> {
        await this.page.goto('/punto-venta/comprobantes');
        await this.page.waitForLoadState('networkidle');
        await this.page.locator(
            '[id="pv_comprobantes_cmp-filtros-comprobantes:state_v-button-filter-border:activar-filtros-avanzados"]',
        ).waitFor({state: 'visible', timeout: 30_000});
    }

    async buscarPorSerieCorrelativo(comprobante: ComprobanteInfo): Promise<void> {
        await this.filtros.abrirFiltrosAvanzados();
        await this.filtros.filtrarPorCorrelativos(comprobante.correlativo);
    }


    async abrirFiltrosAvanzados(): Promise<void> {
        return this.filtros.abrirFiltrosAvanzados();
    }

    async aplicarFiltros(): Promise<void> {
        return this.filtros.aplicarFiltros();
    }

    async borrarFiltros(): Promise<void> {
        return this.filtros.borrarFiltros();
    }

    async filtrarPorCorrelativo(correlativo: string): Promise<void> {
        return this.filtros.filtrarPorCorrelativo(correlativo);
    }

    async filtrarPorCorrelativos(correlativo: string): Promise<void> {
        return this.filtros.filtrarPorCorrelativos(correlativo);
    }

    async filtrarPorRangoFecha(preset: BcPresetFecha): Promise<void> {
        return this.filtros.filtrarPorRangoFecha(preset);
    }

    async filtrarPorTipo(tipo: string): Promise<void> {
        return this.filtros.filtrarPorTipo(tipo);
    }

    async filtrarPorSerie(serie: string): Promise<void> {
        return this.filtros.filtrarPorSerie(serie);
    }

    async filtrarPorMoneda(moneda: string): Promise<void> {
        return this.filtros.filtrarPorMoneda(moneda);
    }

    async filtrarPorNombreCliente(nombre: string): Promise<void> {
        return this.filtros.filtrarPorNombreCliente(nombre);
    }

    async filtrarPorNumDocCliente(documento: string): Promise<void> {
        return this.filtros.filtrarPorNumDocCliente(documento);
    }

    async filtrarPorMontoTotal(comparador: string, valor: string): Promise<void> {
        return this.filtros.filtrarPorMontoTotal(comparador, valor);
    }

    async seleccionarCategoria(categoria: BcCategoria): Promise<void> {
        return this.filtros.seleccionarCategoria(categoria);
    }


    obtenerFilaPorNumero(numeroCompleto: string) {
        return this.grid.obtenerFilaPorNumero(numeroCompleto);
    }

    async validarSinResultados(): Promise<void> {
        return this.grid.validarSinResultados();
    }

    async obtenerColumnasVisibles(): Promise<string[]> {
        return this.grid.obtenerColumnasVisibles();
    }

    async obtenerValoresColumna(nombreColumna: string): Promise<string[]> {
        return this.grid.obtenerValoresColumna(nombreColumna);
    }

    async obtenerIdentificadoresPrimeraPagina(): Promise<string[]> {
        return this.grid.obtenerIdentificadoresPrimeraPagina();
    }

    async ordenarPorColumna(nombreColumna: string): Promise<void> {
        return this.grid.ordenarPorColumna(nombreColumna);
    }

    get btnSiguiente() {
        return this.grid.btnSiguiente;
    }

    async irAPaginaSiguiente(): Promise<boolean> {
        return this.grid.irAPaginaSiguiente();
    }

    estadoDe(comprobante: ComprobanteInfo) {
        return this.grid.estadoDe(comprobante);
    }


    async abrirDropdownPrimerComprobante(): Promise<void> {
        return this.acciones.abrirDropdownPrimerComprobante();
    }

    async abrirDropdownPorIcono(): Promise<void> {
        return this.acciones.abrirDropdownPorIcono();
    }

    async abrirAccionesDeComprobante(numeroCompleto: string): Promise<void> {
        return this.acciones.abrirAccionesDeComprobante(numeroCompleto);
    }

    async abrirAccionesDelPrimerComprobante(): Promise<void> {
        return this.acciones.abrirAccionesDelPrimerComprobante();
    }

    async seleccionarAccion(nombreAccion: string): Promise<void> {
        return this.acciones.seleccionarAccion(nombreAccion);
    }

    async seleccionarAccionPorId(idAccion: string): Promise<void> {
        return this.acciones.seleccionarAccionPorId(idAccion);
    }

    async validarAccionVisible(nombreAccion: string): Promise<void> {
        return this.acciones.validarAccionVisible(nombreAccion);
    }

    async validarAccionOculta(nombreAccion: string): Promise<void> {
        return this.acciones.validarAccionOculta(nombreAccion);
    }

    async validarOpcionesGenerarComprobante(opciones: string[]): Promise<void> {
        return this.acciones.validarOpcionesGenerarComprobante(opciones);
    }

    async abrirGenerarComprobante(tipoComprobante: string, nombreCaja: string): Promise<Page> {
        return this.acciones.abrirGenerarComprobante(tipoComprobante, nombreCaja);
    }

    async emitirGuiaRemisionGuardada(): Promise<void> {
        return this.acciones.emitirGuiaRemisionGuardada();
    }

    async confirmarEliminacion(motivo: string): Promise<void> {
        return this.acciones.confirmarEliminacion(motivo);
    }

    async cerrarModalExito(): Promise<void> {
        return this.acciones.cerrarModalExito();
    }

    async clonarHaciaCaja(nombreCaja: string): Promise<void> {
        return this.acciones.clonarHaciaCaja(nombreCaja);
    }

    async validarCajaBloqueada(nombreCaja: string, mensaje: string): Promise<void> {
        return this.acciones.validarCajaBloqueada(nombreCaja, mensaje);
    }

    async seleccionarCajaParaClonar(nombreCaja: string) {
        return this.acciones.seleccionarCajaParaClonar(nombreCaja);
    }

    async confirmarClonacion(): Promise<Page> {
        return this.acciones.confirmarClonacion();
    }


    async abrirBitacora(): Promise<void> {
        return this.bitacora.abrirBitacora();
    }

    async cerrarBitacora(): Promise<void> {
        return this.bitacora.cerrarBitacora();
    }

    async abrirBitacoraDelPrimerComprobante(): Promise<void> {
        return this.bitacora.abrirBitacoraDelPrimerComprobante();
    }

    async validarCDRAceptado(): Promise<void> {
        return this.bitacora.validarCDRAceptado();
    }

    async validarDescargoInventarios(): Promise<void> {
        return this.bitacora.validarDescargoInventarios();
    }

    async validarSinDescargoInventarios(): Promise<void> {
        return this.bitacora.validarSinDescargoInventarios();
    }

    async validarComprobanteEmitido(estadoSunat?: 'EXITOSO' | 'TRANSITORIO' | 'DEFINITIVO'): Promise<void> {
        return this.bitacora.validarComprobanteEmitido(estadoSunat);
    }

    async validarComprobanteEmitidonota(): Promise<void> {
        return this.bitacora.validarComprobanteEmitidonota();
    }

    async validarXMLGenerado(): Promise<void> {
        return this.bitacora.validarXMLGenerado();
    }

    async validarPDFGenerado(): Promise<void> {
        return this.bitacora.validarPDFGenerado();
    }

    async validarBitacoraDelPrimerComprobante(eventos: string[]): Promise<void> {
        return this.bitacora.validarBitacoraDelPrimerComprobante(eventos);
    }

    async validarBitacoraContiene(comprobante: ComprobanteInfo, eventos: string[]): Promise<void> {
        return this.bitacora.validarBitacoraContiene(comprobante, eventos);
    }


    async abrirConfiguracionColumnas(): Promise<void> {
        return this.columnas.abrirConfiguracionColumnas();
    }

    async configurarColumna(categoria: string, campoId: string, activar: boolean): Promise<boolean> {
        return this.columnas.configurarColumna(categoria, campoId, activar);
    }

    async guardarConfiguracionColumnas(): Promise<void> {
        return this.columnas.guardarConfiguracionColumnas();
    }

    async activarTodasLasColumnas(): Promise<void> {
        return this.columnas.activarTodasLasColumnas();
    }


    async filtrarAdelanto(emision: EmisionResult | null): Promise<void> {
        return this.adelantos.filtrarAdelanto(emision);
    }

    async filtrarAdelantoFactura(emision: EmisionResult | null): Promise<void> {
        return this.adelantos.filtrarAdelantoFactura(emision);
    }


    async abrirVerComprobante(): Promise<Page> {
        await this.acciones.abrirDropdownPrimerComprobante();
        return this.verComprobante.abrirVerComprobante();
    }

    async abrirVerComprobanteDesdeMenu(): Promise<Page> {
        return this.verComprobante.abrirVerComprobanteDesdeMenu();
    }

    async validarRetencionEnPopup(popupPage: Page, porcentaje: string): Promise<void> {
        return this.verComprobante.validarRetencionEnPopup(popupPage, porcentaje);
    }

    async validarDetraccionEnPopup(popupPage: Page): Promise<void> {
        return this.verComprobante.validarDetraccionEnPopup(popupPage);
    }

    async validarFacturaAdelantoEnPopup(popupPage: Page): Promise<void> {
        return this.verComprobante.validarFacturaAdelantoEnPopup(popupPage);
    }

    async validarAdelantosAplicadosEnPopup(popupPage: Page): Promise<void> {
        return this.verComprobante.validarAdelantosAplicadosEnPopup(popupPage);
    }

    async clickAccionesExtra(popupPage: Page): Promise<void> {
        return this.verComprobante.clickAccionesExtra(popupPage);
    }

    async clickDatosOpcionales(popupPage: Page): Promise<void> {
        return this.verComprobante.clickDatosOpcionales(popupPage);
    }

    async cerrarDrapePopup(popupPage: Page): Promise<void> {
        return this.verComprobante.cerrarDrapePopup(popupPage);
    }

    async abrirDatosOpcionalesEnPopup(popupPage: Page): Promise<void> {
        return this.verComprobante.abrirDatosOpcionalesEnPopup(popupPage);
    }

    async validarDatosOpcionalesEnPopup(popupPage: Page, datos: DatosOpcionales): Promise<void> {
        return this.verComprobante.validarDatosOpcionalesEnPopup(popupPage, datos);
    }

    async abrirBitacoraDesdePopup(popupPage: Page): Promise<void> {
        return this.verComprobante.abrirBitacoraDesdePopup(popupPage);
    }


    get ultimoComprobanteConsulta() {
        return this.sunat.ultimoComprobanteConsulta;
    }

    async consultarSunatPorCorrelativo(correlativo: string): Promise<void> {
        return this.sunat.consultarPorCorrelativo(correlativo);
    }

    async validarEstadoSunat(): Promise<'EXITOSO' | 'TRANSITORIO' | 'DEFINITIVO'> {
        return this.sunat.validarEstadoSunat();
    }
}
