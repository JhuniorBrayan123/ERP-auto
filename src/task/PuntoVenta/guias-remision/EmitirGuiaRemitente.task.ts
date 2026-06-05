import {Page, test} from '@playwright/test';
import {GuiaRemitentePage} from '@pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {runFunctionalAction} from '@utils/functional-step';

const normalizarMotivo = (motivo: string): string =>
    motivo
        .trim()
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const MOTIVOS_ACEPTAN_DNI = new Set<string>([
    'VENTA',
    'OTROS MOTIVOS',
    'DEVOLUCION',
    'CONSIGNACION',
]);

export const motivoAceptaDni = (motivo?: string): boolean => {
    if (!motivo) return false;
    return MOTIVOS_ACEPTAN_DNI.has(normalizarMotivo(motivo));
};

export const motivoRequiereComprador = (motivo?: string): boolean =>
    !!motivo && normalizarMotivo(motivo) === 'VENTA CON ENTREGA A TERCEROS';

export const motivoEsMercanciaExtranjera = (motivo?: string): boolean =>
    !!motivo && normalizarMotivo(motivo) === 'TRASLADO DE MERCANCIA EXTRANJERA';

export const resolverUbigeosPorMotivo = (motivo?: string) => {
    if (motivoEsMercanciaExtranjera(motivo)) {
        return {
            partida: GUIAS_DATA.MERCANCIA_EXTRANJERA.UBIGEO_PARTIDA,
            llegada: GUIAS_DATA.MERCANCIA_EXTRANJERA.UBIGEO_LLEGADA,
        };
    }
    return {
        partida: GUIAS_DATA.REMITENTE.UBIGEO,
        llegada: GUIAS_DATA.DESTINATARIO.UBIGEO,
    };
};

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
    destinatarioDocumento?: string;
    destinatarioNombre?: string;
    forzarDestinatario?: 'DNI' | 'RUC';
};

export type DestinatarioGuiaOptions = Pick<
    EmitirGuiaRemitenteData,
    'motivo' | 'destinatarioDocumento' | 'destinatarioNombre' | 'forzarDestinatario'
>;

export const obtenerDestinatarioPorMotivo = (data: DestinatarioGuiaOptions) => {
    const usarDni = data.forzarDestinatario
        ? data.forzarDestinatario === 'DNI'
        : motivoAceptaDni(data.motivo);

    if (usarDni) {
        return {
            documento: data.destinatarioDocumento || GUIAS_DATA.DESTINATARIO.DNI,
            nombre: data.destinatarioNombre || GUIAS_DATA.DESTINATARIO.NOMBRE_DNI,
        };
    }

    return {
        documento: data.destinatarioDocumento || GUIAS_DATA.DESTINATARIO.RUC,
        nombre: data.destinatarioNombre || GUIAS_DATA.DESTINATARIO.NOMBRE_RUC,
    };
};

export const EmitirGuiaRemitenteTask = (data: EmitirGuiaRemitenteData) => {
    const fn = async (page: Page) => {
        const guiaPage = new GuiaRemitentePage(page);

        await runFunctionalAction(page, {
            module: 'Emisiones',
            screen: 'Guía de Remisión Remitente',
            flowStep: 'Completar datos de la guía',
            userMessage: 'No se pudo completar los datos de la guía',
            technicalDetail: 'Error al llenar datos del formulario',
            failureCategory: 'SCRIPT'
        }, async () => {
            await test.step('Seleccionar tipo de operación o motivo', async () => {
                if (data.tipoOperacion === 'COMPRA') {
                    await guiaPage.seleccionarTipoOperacion('COMPRA');
                } else {
                    await guiaPage.seleccionarMotivo(data.motivo!);
                }
            });
            await test.step(`Seleccionar modalidad: ${data.modalidad}`, async () => {
                await guiaPage.seleccionarModalidad(data.modalidad);
            });

            if (data.esExportacion) {
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
            }

            if (data.tipoOperacion === 'COMPRA') {
                await test.step('Seleccionar proveedor', async () => {
                    await guiaPage.seleccionarProveedor(data.proveedorDocumento || GUIAS_DATA.REMITENTE.DNI);
                });
                const partida = data.puntoPartida || GUIAS_DATA.REMITENTE.UBIGEO;
                const llegada = data.puntoLlegada || GUIAS_DATA.DESTINATARIO.UBIGEO;
                const partidaDir = data.direccionPartida || GUIAS_DATA.REMITENTE.DIRECCION;
                await test.step('Completar punto de partida y llegada', async () => {
                    await guiaPage.completarPuntoPartidaYLlegada(
                        partida,
                        llegada,
                        partidaDir,
                        GUIAS_DATA.DESTINATARIO.DIRECCION
                    );
                });
            } else {
                const destinatario = obtenerDestinatarioPorMotivo(data);
                const ubigeos = resolverUbigeosPorMotivo(data.motivo);

                if (motivoRequiereComprador(data.motivo)) {
                    await test.step('Seleccionar comprador', async () => {
                        await guiaPage.seleccionarComprador(
                            destinatario.documento,
                            destinatario.nombre
                        );
                    });
                    await test.step('Seleccionar destinatario', async () => {
                        await guiaPage.seleccionarDestinatarioSiAplica(
                            destinatario.documento,
                            destinatario.nombre
                        );
                    });
                } else {
                    await test.step('Seleccionar destinatario', async () => {
                        await guiaPage.seleccionarDestinatarioSiAplica(
                            destinatario.documento,
                            destinatario.nombre
                        );
                    });
                }

                await test.step('Completar punto de partida y llegada', async () => {
                    await guiaPage.completarPuntoPartidaYLlegada(
                        ubigeos.partida,
                        ubigeos.llegada,
                        GUIAS_DATA.REMITENTE.DIRECCION,
                        GUIAS_DATA.DESTINATARIO.DIRECCION
                    );
                });
            }

            if (data.modalidad === 'PUBLICA') {
                await test.step('Seleccionar transportista', async () => {
                    await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
                });
                await test.step('Completar MTC', async () => {
                    await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
                });
            } else {
                await test.step('Seleccionar conductor', async () => {
                    await guiaPage.seleccionarConductor(GUIAS_DATA.REMITENTE.DNI);
                });
                await test.step('Completar placa y licencia', async () => {
                    await guiaPage.completarPlacaYLicencia(GUIAS_DATA.TRANSPORTISTA.PLACA, GUIAS_DATA.TRANSPORTISTA.LICENCIA);
                });
            }

            for (let i = 0; i < data.items.length; i++) {
                await test.step(`Buscar y seleccionar ítem ${i + 1}: ${data.items[i].codigoONombre}`, async () => {
                    await guiaPage.buscarYSeleccionarItem(data.items[i].codigoONombre);
                });
            }

            await test.step(`Definir peso total: ${data.peso}`, async () => {
                await guiaPage.definirPesoTotal(data.peso.includes('.') ? 'Kg' : 'Tn', data.peso);
            });

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
    fn.displayName = 'Emitir guía remitente';
    return fn;
};
