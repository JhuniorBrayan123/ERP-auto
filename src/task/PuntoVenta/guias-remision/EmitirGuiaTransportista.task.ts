import {Page, test} from '@playwright/test';
import {GuiaTransportistaPage} from '@pages/PuntoVenta/guias-remision/GuiaTransportistaPage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {runFunctionalAction} from '@utils/functional-step';
import {esperarCargaOverlay, esperarDebounce} from "@utils/wait-helpers";

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
    fechaInicioTrasladoDiasAtras?: number;
    
    skipConductor?: boolean;
    skipTransportista?: boolean;
    skipPuntoPartida?: boolean;
    skipItems?: boolean;
};

export const EmitirGuiaTransportistaTask = (data: EmitirGuiaTransportistaData) => {
    const fn = async (page: Page) => {
        const guiaPage = new GuiaTransportistaPage(page);

        await runFunctionalAction(page, {
            module: 'Emisiones',
            screen: 'Guía de Remisión Transportista',
            flowStep: 'Completar datos de la guía transportista',
            userMessage: 'No se pudo completar los datos de la guía',
            technicalDetail: 'Error al llenar datos del formulario',
            failureCategory: 'SCRIPT'
        }, async () => {
            await test.step('Seleccionar remitente', async () => {
                await guiaPage.seleccionarRemitente(GUIAS_DATA.DESTINATARIO.DNI);
            });
            await test.step('Seleccionar destinatario', async () => {
                await guiaPage.seleccionarDestinatario(GUIAS_DATA.DESTINATARIO.RUC);
            });

            if (!data.skipConductor) {
                await test.step('Seleccionar conductor', async () => {
                    await guiaPage.seleccionarConductor(GUIAS_DATA.TRANSPORTISTA.DNI_CONDUCTOR);
                });
                await test.step('Completar placa y licencia', async () => {
                    await guiaPage.completarPlacaYLicencia(
                        GUIAS_DATA.TRANSPORTISTA.PLACA,
                        GUIAS_DATA.TRANSPORTISTA.LICENCIA
                    );
                });
                await test.step('Completar MTC', async () => {
                    await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
                });
                await test.step('Completar TUCE', async () => {
                    await guiaPage.completarTUCE(GUIAS_DATA.TRANSPORTISTA.TUCE);
                });
            }

            if (!data.skipTransportista) {
                await test.step('Seleccionar transportista', async () => {
                    await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
                });
            }

            if (data.vincularComprobante) {
                const {tipo, serie, correlativo, rucProveedor} = data.vincularComprobante;
                await test.step(`Vincular comprobante: ${tipo} ${serie}-${correlativo}`, async () => {
                    await guiaPage.vincularComprobante(tipo, serie, correlativo, rucProveedor);
                });
            }

            if (data.pagadorFlete) {
                await test.step(`Seleccionar pagador flete: ${data.pagadorFlete}`, async () => {
                    await guiaPage.seleccionarPagadorFlete(data.pagadorFlete!);
                });
            }
            const pagadorFleteData = data.pagadorFleteData;

            if (pagadorFleteData) {
                await test.step('Completar datos del pagador flete', async () => {
                    await guiaPage.completarPagadorFleteData(pagadorFleteData.documento);
                });
            }

            if (data.retorno) {
                await test.step(`Seleccionar retorno: ${data.retorno}`, async () => {
                    await guiaPage.seleccionarRetorno(data.retorno!);
                });
            }

            const subcontratador = data.subcontratador;

            if (subcontratador) {
                await test.step(`Seleccionar subcontratador: ${subcontratador.documento}`, async () => {
                    await guiaPage.seleccionarSubcontratador(subcontratador.documento);
                });
            }

            if (!data.skipPuntoPartida) {
                await test.step('Completar punto de partida y llegada', async () => {
                    await guiaPage.completarPuntoPartidaYLlegada(
                        GUIAS_DATA.PUNTO_PARTIDA.UBIGEO,
                        GUIAS_DATA.PUNTO_LLEGADA.UBIGEO,
                        GUIAS_DATA.PUNTO_PARTIDA.DIRECCION,
                        GUIAS_DATA.PUNTO_LLEGADA.DIRECCION
                    );
                });
            }
            const autorizacionEspecial = data.autorizacionEspecial;

            if (autorizacionEspecial) {
                await test.step('Completar autorización especial', async () => {
                    await guiaPage.completarAutorizacionEspecial(
                        autorizacionEspecial.numeroAutorizacion,
                        autorizacionEspecial.tuce
                    );
                });
            }

            if (!data.skipItems) {
                for (let i = 0; i < data.items.length; i++) {
                    await test.step(`Buscar y seleccionar ítem ${i + 1}: ${data.items[i].codigoONombre}`, async () => {
                        await guiaPage.buscarYSeleccionarItem(data.items[i].codigoONombre);
                    });
                }
            }

            await test.step(`Definir peso total: ${data.peso}`, async () => {
                await guiaPage.definirPesoTotal(data.peso);
            });

            if (data.decrementarCantidad) {
                await test.step('Decrementar cantidad', async () => {
                    await guiaPage.decrementarCantidad();
                });
            }

            if (data.fechaInicioTrasladoDiasAtras) {
                await test.step(`Seleccionar fecha inicio traslado: ${data.fechaInicioTrasladoDiasAtras} días atrás`, async () => {
                    await guiaPage.fechaTrasladoPicker.click();
                    const hoy = new Date();
                    const target = new Date(hoy);
                    target.setDate(hoy.getDate() - data.fechaInicioTrasladoDiasAtras!);
                    const dia = target.getDate();
                    await page.getByRole('button').filter({ hasText: new RegExp(`^${dia}$`) }).first().click();
                });
            }

            await test.step('Emitir guía', async () => {
                await guiaPage.emitirGuia();
            });
        });
    };
    fn.displayName = 'Emitir guía transportista';
    return fn;
};
