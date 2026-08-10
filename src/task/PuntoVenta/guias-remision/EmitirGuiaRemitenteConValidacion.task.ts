import {Page, test} from '@playwright/test';
import {GuiaRemitentePage} from '@pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {runFunctionalAction} from '@utils/functional-step';
import {
    motivoRequiereComprador,
    obtenerDestinatarioPorMotivo,
    resolverUbigeosPorMotivo,
} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitente.task';

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
    fechaInicioTrasladoDiasAtras?: number;
};

export const EmitirGuiaRemitenteConValidacionTask = (data: EmitirGuiaRemitenteConValidacionData) => {
    const fn = async (page: Page) => {
        const guiaPage = new GuiaRemitentePage(page);

        await runFunctionalAction(page, {
            module: 'Emisiones',
            screen: 'Guía de Remisión Remitente',
            flowStep: 'Completar datos de la guía (validación)',
            userMessage: 'No se pudo completar los datos de la guía',
            technicalDetail: 'Error al llenar datos del formulario',
            failureCategory: 'SCRIPT'
        }, async () => {

            if (data.motivo) {
                await test.step(`Seleccionar motivo: ${data.motivo}`, async () => {
                    await guiaPage.seleccionarMotivo(data.motivo!);
                });
            }
            if (data.modalidad) {
                await test.step(`Seleccionar modalidad: ${data.modalidad}`, async () => {
                    await guiaPage.seleccionarModalidad(data.modalidad!);
                });
            }
            if (data.dam) {
                await test.step('Completar DAM', async () => {
                    await guiaPage.completarDam(data.dam!);
                });
            }
            if (data.bultos) {
                await test.step('Completar bultos', async () => {
                    await guiaPage.completarBultos(data.bultos!);
                });
            }

            if (!data.skipDestinatario && data.motivo) {
                const destinatario = obtenerDestinatarioPorMotivo({motivo: data.motivo});

                if (motivoRequiereComprador(data.motivo)) {
                    await test.step('Seleccionar comprador', async () => {
                        await guiaPage.seleccionarComprador(
                            destinatario.documento,
                            destinatario.nombre
                        );
                    });
                }

                await test.step('Seleccionar destinatario', async () => {
                    await guiaPage.seleccionarDestinatarioSiAplica(
                        destinatario.documento,
                        destinatario.nombre
                    );
                });
            }

            if (!data.skipUbigeo) {
                await test.step('Completar punto de partida y llegada', async () => {
                    const ubigeos = resolverUbigeosPorMotivo(data.motivo);
                    await guiaPage.completarPuntoPartidaYLlegada(
                        ubigeos.partida,
                        ubigeos.llegada,
                        GUIAS_DATA.REMITENTE.DIRECCION,
                        GUIAS_DATA.DESTINATARIO.DIRECCION
                    );
                });
            }

            if (data.trasladoVehiculosM1) {
                await test.step('Seleccionar traslado vehículos M1', async () => {
                    await guiaPage.seleccionarTrasladoVehiculosM1();
                });
            }

            if (!data.skipConductor) {
                await test.step('Seleccionar conductor', async () => {
                    await guiaPage.seleccionarConductor(GUIAS_DATA.REMITENTE.DNI);
                });
                await test.step('Completar placa y licencia', async () => {
                    await guiaPage.completarPlacaYLicencia(
                        GUIAS_DATA.TRANSPORTISTA.PLACA,
                        GUIAS_DATA.TRANSPORTISTA.LICENCIA
                    );
                });
            }

            if (!data.skipTransportista) {
                await test.step('Seleccionar transportista', async () => {
                    await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
                });
                await test.step('Completar MTC', async () => {
                    await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
                });
            }

            if (data.contenedorNumero !== undefined && data.contenedorPrecinto !== undefined) {
                await test.step(`Añadir contenedor: ${data.contenedorNumero}`, async () => {
                    await guiaPage.anadirContenedor(data.contenedorNumero!, data.contenedorPrecinto!);
                });
            }

            const items = data.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    await test.step(`Buscar y seleccionar ítem ${i + 1}: ${items[i].codigoONombre}`, async () => {
                        await guiaPage.buscarYSeleccionarItem(items[i].codigoONombre);
                    });
                }
            }

            const peso = data.peso;
            if (peso) {
                await test.step(`Definir peso total: ${peso}`, async () => {
                    await guiaPage.definirPesoTotal(peso.includes('.') ? 'Kg' : 'Tn', data.peso!);
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

            if (data.guardarEnVezDeEmitir) {
                await test.step('Guardar guía', async () => {
                    await guiaPage.guardarGuia();
                });
            } else {
                await test.step('Emitir guía', async () => {
                    await guiaPage.emitirGuia();
                });
            }
        });
    };
    fn.displayName = 'Emitir guía remitente (validación)';
    return fn;
};
