import {Page} from '@playwright/test';
import {GuiaTransportistaPage} from '@pages/PuntoVenta/guias-remision/GuiaTransportistaPage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {runFunctionalAction} from '@utils/functional-step';

export type EmitirGuiaTransportistaData = {
    peso: string;
    items: Array<{ codigoONombre: string }>;
    vincularComprobante?: {
        tipo: 'BOLETA_DE_VENTA' | 'FACTURA';
        serie: string;
        correlativo: string;
        rucProveedor: string;
    };
    pagadorFlete?: 'remitente' | 'destinatario' | 'otros_terceros' | 'subcontratador';
    pagadorFleteData?: {
        documento: string;
    };
    retorno?: 'retorno-vehiculo' | 'transporte-subcontratado';
    subcontratador?: {
        documento: string;
    };
    autorizacionEspecial?: {
        numeroAutorizacion: string;
        tuce?: string;
    };
    decrementarCantidad?: boolean;
    fechaInicioTraslado?: string;
    // Skip flags para validaciones — omiten el paso correspondiente
    skipConductor?: boolean;
    skipTransportista?: boolean;
    skipPuntoPartida?: boolean;
    skipItems?: boolean;
};

export const EmitirGuiaTransportistaTask = (data: EmitirGuiaTransportistaData) => {
    return async (page: Page) => {
        const guiaPage = new GuiaTransportistaPage(page);

        await runFunctionalAction(page, {
            module: 'Emisiones',
            screen: 'Guía de Remisión Transportista',
            flowStep: 'Completar datos de la guía transportista',
            userMessage: 'No se pudo completar los datos de la guía',
            technicalDetail: 'Error al llenar datos del formulario',
            failureCategory: 'SCRIPT'
        }, async () => {
            // === DATOS OBLIGATORIOS SIEMPRE ===
            await guiaPage.seleccionarRemitente(GUIAS_DATA.REMITENTE.DNI);
            await guiaPage.seleccionarDestinatario(GUIAS_DATA.DESTINATARIO.RUC);

            // === CONDUCTOR (opcional con skip) ===
            if (!data.skipConductor) {
                await guiaPage.seleccionarConductor(GUIAS_DATA.TRANSPORTISTA.DNI_CONDUCTOR);
                await guiaPage.completarPlacaYLicencia(
                    GUIAS_DATA.TRANSPORTISTA.PLACA,
                    GUIAS_DATA.TRANSPORTISTA.LICENCIA
                );
                await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
                await guiaPage.completarTUCE(GUIAS_DATA.TRANSPORTISTA.TUCE);
            }

            // === TRANSPORTISTA (opcional con skip) ===
            if (!data.skipTransportista) {
                await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
            }

            // === VINCULAR COMPROBANTE ===
            if (data.vincularComprobante) {
                const { tipo, serie, correlativo, rucProveedor } = data.vincularComprobante;
                await guiaPage.vincularComprobante(tipo, serie, correlativo, rucProveedor);
            }

            // === PAGADOR DE FLETE ===
            if (data.pagadorFlete) {
                await guiaPage.seleccionarPagadorFlete(data.pagadorFlete);
            }
            if (data.pagadorFleteData) {
                await guiaPage.completarPagadorFleteData(data.pagadorFleteData.documento);
            }

            // === RETORNO ===
            if (data.retorno) {
                await guiaPage.seleccionarRetorno(data.retorno);
            }

            // === SUBCONTRATADOR ===
            if (data.subcontratador) {
                await guiaPage.seleccionarSubcontratador(data.subcontratador.documento);
            }

            // === PUNTO PARTIDA / LLEGADA (opcional con skip) ===
            if (!data.skipPuntoPartida) {
                await guiaPage.completarPuntoPartidaYLlegada(
                    GUIAS_DATA.PUNTO_PARTIDA.UBIGEO,
                    GUIAS_DATA.PUNTO_LLEGADA.UBIGEO,
                    GUIAS_DATA.PUNTO_PARTIDA.DIRECCION
                );
            }

            // === AUTORIZACIÓN ESPECIAL ===
            if (data.autorizacionEspecial) {
                await guiaPage.completarAutorizacionEspecial(
                    data.autorizacionEspecial.numeroAutorizacion,
                    data.autorizacionEspecial.tuce
                );
            }

            // === ITEMS (opcional con skip) ===
            if (!data.skipItems) {
                for (const item of data.items) {
                    await guiaPage.buscarYSeleccionarItem(item.codigoONombre);
                }
            }

            // === DEFINIR PESO ===
            await guiaPage.definirPesoTotal(data.peso);

            // === DECREMENTAR CANTIDAD (para validación GRT-25) ===
            if (data.decrementarCantidad) {
                await guiaPage.decrementarCantidad();
            }

            // === FECHA INICIO TRASLADO (para validación GRT-22) ===
            if (data.fechaInicioTraslado) {
                // No disponible en page object — se usa locator directo
                await page.getByRole('textbox', {name: /fecha.*inicio.*traslado/i}).fill(data.fechaInicioTraslado);
            }

            // === EMITIR ===
            await guiaPage.emitirGuia();
        });
    };
};
