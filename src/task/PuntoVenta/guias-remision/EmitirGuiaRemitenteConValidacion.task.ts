import {Page} from '@playwright/test';
import {GuiaRemitentePage} from '@pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {runFunctionalAction} from '@utils/functional-step';

export type EmitirGuiaRemitenteConValidacionData = {
    motivo?: string;
    modalidad?: 'PUBLICA' | 'PRIVADA';
    dam?: string;
    bultos?: string;
    items?: Array<{ codigoONombre: string }>;
    peso?: string;
    guardarEnVezDeEmitir?: boolean;
    contenedorNumero?: string;
    contenedorPrecinto?: string;
    trasladoVehiculosM1?: boolean;
    skipDestinatario?: boolean;
    skipUbigeo?: boolean;
    skipConductor?: boolean;
    skipTransportista?: boolean;
};

export const EmitirGuiaRemitenteConValidacionTask = (data: EmitirGuiaRemitenteConValidacionData) => {
    return async (page: Page) => {
        const guiaPage = new GuiaRemitentePage(page);

        await runFunctionalAction(page, {
            module: 'Emisiones',
            screen: 'Guía de Remisión Remitente',
            flowStep: 'Completar datos de la guía (validación)',
            userMessage: 'No se pudo completar los datos de la guía',
            technicalDetail: 'Error al llenar datos del formulario',
            failureCategory: 'SCRIPT'
        }, async () => {
            if (data.motivo) await guiaPage.seleccionarMotivo(data.motivo);
            if (data.modalidad) await guiaPage.seleccionarModalidad(data.modalidad);
            if (data.dam) await guiaPage.completarDam(data.dam);
            if (data.bultos) await guiaPage.completarBultos(data.bultos);

            if (!data.skipDestinatario) {
                await guiaPage.seleccionarDestinatario(GUIAS_DATA.DESTINATARIO.DNI, GUIAS_DATA.DESTINATARIO.NOMBRE_DNI);
            }

            if (!data.skipUbigeo) {
                await guiaPage.completarPuntoPartidaYLlegada(
                    GUIAS_DATA.DESTINATARIO.UBIGEO,
                    GUIAS_DATA.DESTINATARIO.UBIGEO,
                    GUIAS_DATA.REMITENTE.DIRECCION
                );
            }

            if (data.trasladoVehiculosM1) {
                await guiaPage.seleccionarTrasladoVehiculosM1();
            }

            if (!data.skipConductor) {
                await guiaPage.seleccionarConductor(GUIAS_DATA.REMITENTE.DNI);
                await guiaPage.completarPlacaYLicencia(GUIAS_DATA.TRANSPORTISTA.PLACA, GUIAS_DATA.TRANSPORTISTA.LICENCIA);
            }

            if (!data.skipTransportista) {
                await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
                await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
            }

            if (data.contenedorNumero !== undefined && data.contenedorPrecinto !== undefined) {
                await guiaPage.anadirContenedor(data.contenedorNumero, data.contenedorPrecinto);
            }

            if (data.items) {
                for (const item of data.items) {
                    await guiaPage.buscarYSeleccionarItem(item.codigoONombre);
                }
            }

            if (data.peso) {
                await guiaPage.definirPesoTotal(data.peso.includes('.') ? 'Kg' : 'Tn', data.peso);
            }

            if (data.guardarEnVezDeEmitir) {
                await guiaPage.guardarGuia();
            } else {
                await guiaPage.emitirGuia();
            }
        });
    };
};
