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
    retorno?: 'Retorno de vehículo con envases o embalajes vacíos' | 'Retorno de vehículo vacío' | 'Transporte subcontratado';
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
            await guiaPage.seleccionarRemitente(GUIAS_DATA.DESTINATARIO.DNI);
            await guiaPage.seleccionarDestinatario(GUIAS_DATA.DESTINATARIO.RUC);
            if (!data.skipConductor) {
                await guiaPage.seleccionarConductor(GUIAS_DATA.TRANSPORTISTA.DNI_CONDUCTOR);
                await guiaPage.completarPlacaYLicencia(
                    GUIAS_DATA.TRANSPORTISTA.PLACA,
                    GUIAS_DATA.TRANSPORTISTA.LICENCIA
                );
                await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
                await guiaPage.completarTUCE(GUIAS_DATA.TRANSPORTISTA.TUCE);
            }

            if (!data.skipTransportista) {
                await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
            }

            if (data.vincularComprobante) {
                const {tipo, serie, correlativo, rucProveedor} = data.vincularComprobante;
                await guiaPage.vincularComprobante(tipo, serie, correlativo, rucProveedor);
            }

            if (data.pagadorFlete) {
                await guiaPage.seleccionarPagadorFlete(data.pagadorFlete);
            }
            if (data.pagadorFleteData) {
                await guiaPage.completarPagadorFleteData(data.pagadorFleteData.documento);
            }

            if (data.retorno) {
                await guiaPage.seleccionarRetorno(data.retorno);
            }

            if (data.subcontratador) {
                await guiaPage.seleccionarSubcontratador(data.subcontratador.documento);
            }

            if (!data.skipPuntoPartida) {
                await guiaPage.completarPuntoPartidaYLlegada(
                    GUIAS_DATA.PUNTO_PARTIDA.UBIGEO,
                    GUIAS_DATA.PUNTO_LLEGADA.UBIGEO,
                    GUIAS_DATA.PUNTO_PARTIDA.DIRECCION,
                    GUIAS_DATA.PUNTO_LLEGADA.DIRECCION
                );
            }
            if (data.autorizacionEspecial) {
                await guiaPage.completarAutorizacionEspecial(
                    data.autorizacionEspecial.numeroAutorizacion,
                    data.autorizacionEspecial.tuce
                );
            }

            if (!data.skipItems) {
                for (const item of data.items) {
                    await guiaPage.buscarYSeleccionarItem(item.codigoONombre);
                }
            }

            await guiaPage.definirPesoTotal(data.peso);

            if (data.decrementarCantidad) {
                await guiaPage.decrementarCantidad();
            }

            if (data.fechaInicioTraslado) {
                await page.getByRole('textbox', {name: /fecha.*inicio.*traslado/i}).fill(data.fechaInicioTraslado);
            }

            await guiaPage.emitirGuia();
        });
    };
};
