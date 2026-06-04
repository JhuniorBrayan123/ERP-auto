import {Page} from '@playwright/test';
import {GuiaRemitentePage} from '@pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {runFunctionalAction} from '@utils/functional-step';

export type EmitirGuiaRemitenteData = {
    motivo?: string;
    modalidad: 'PUBLICA' | 'PRIVADA';
    peso: string;
    esExportacion?: boolean;
    dam?: string;
    bultos?: string;
    items: Array<{ codigoONombre: string }>;
    guardarEnVezDeEmitir?: boolean;
    tipoOperacion?: 'VENTA' | 'COMPRA';
    proveedorDocumento?: string;
    puntoPartida?: string;
    puntoLlegada?: string;
    direccionPartida?: string;
};

export const EmitirGuiaRemitenteTask = (data: EmitirGuiaRemitenteData) => {
    return async (page: Page) => {
        const guiaPage = new GuiaRemitentePage(page);

        await runFunctionalAction(page, {
            module: 'Emisiones',
            screen: 'Guía de Remisión Remitente',
            flowStep: 'Completar datos de la guía',
            userMessage: 'No se pudo completar los datos de la guía',
            technicalDetail: 'Error al llenar datos del formulario',
            failureCategory: 'SCRIPT'
        }, async () => {
            if (data.tipoOperacion === 'COMPRA') {
                await guiaPage.seleccionarTipoOperacion('COMPRA');
            } else {
                await guiaPage.seleccionarMotivo(data.motivo!);
            }
            await guiaPage.seleccionarModalidad(data.modalidad);

            if (data.esExportacion) {
                if (data.dam) await guiaPage.completarDam(data.dam);
                if (data.bultos) await guiaPage.completarBultos(data.bultos);
            }

            if (data.tipoOperacion === 'COMPRA') {
                await guiaPage.seleccionarProveedor(data.proveedorDocumento || GUIAS_DATA.REMITENTE.DNI);
                const partida = data.puntoPartida || GUIAS_DATA.REMITENTE.UBIGEO;
                const llegada = data.puntoLlegada || GUIAS_DATA.DESTINATARIO.UBIGEO;
                const partidaDir = data.direccionPartida || GUIAS_DATA.REMITENTE.DIRECCION;
                await guiaPage.completarPuntoPartidaYLlegada(partida, llegada, partidaDir);
            } else {
                await guiaPage.seleccionarDestinatario(GUIAS_DATA.DESTINATARIO.RUC, GUIAS_DATA.DESTINATARIO.NOMBRE_RUC);
                await guiaPage.completarPuntoPartidaYLlegada(
                    GUIAS_DATA.DESTINATARIO.UBIGEO,
                    GUIAS_DATA.DESTINATARIO.UBIGEO,
                    GUIAS_DATA.REMITENTE.DIRECCION
                );
            }

            if (data.modalidad === 'PUBLICA') {
                await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
                await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
            } else {
                await guiaPage.seleccionarConductor(GUIAS_DATA.REMITENTE.DNI);
                await guiaPage.completarPlacaYLicencia(GUIAS_DATA.TRANSPORTISTA.PLACA, GUIAS_DATA.TRANSPORTISTA.LICENCIA);
            }

            for (const item of data.items) {
                await guiaPage.buscarYSeleccionarItem(item.codigoONombre);
            }

            await guiaPage.definirPesoTotal(data.peso.includes('.') ? 'Kg' : 'Tn', data.peso);

            if (data.guardarEnVezDeEmitir) {
                await guiaPage.guardarGuia();
            } else {
                await guiaPage.emitirGuia();
            }
        });
    };
};
