import {expect, test} from '@fixtures/Logistica/movimientos-fixture';
import {DATOS_CONTACTO} from '@helpers/Logistica/movimiento-data.helper';
import {navegarAIngresosYAbrirAccionesImpresion,} from '@helpers/Logistica/verificaciones-movimientos.helper';

test.describe('MS-08 | Acciones de Movimientos', {tag: ['@logistica', '@movimientos']}, () => {

    test('SC-01: Imprimir movimiento A4 @MS-08.1', async ({
                                                    movimientosNav,
                                                    listadoMovimientos,
                                                }) => {
        await navegarAIngresosYAbrirAccionesImpresion(movimientosNav, listadoMovimientos);
        await test.step('Then: click en imprimir A4', async () => {
            await listadoMovimientos.imprimirA4DesdeLista();
        });
    });

    test('SC-02: Imprimir movimiento Ticket @MS-08.2', async ({
                                                        movimientosNav,
                                                        listadoMovimientos,
                                                    }) => {
        await navegarAIngresosYAbrirAccionesImpresion(movimientosNav, listadoMovimientos);
        await test.step('Then: click en imprimir Ticket', async () => {
            await listadoMovimientos.imprimirTicketDesdeLista();
        });
    });

    test('SC-03: Enviar movimiento por WhatsApp @MS-08.3', async ({
                                                            movimientosNav,
                                                            listadoMovimientos,
                                                        }) => {
        await navegarAIngresosYAbrirAccionesImpresion(movimientosNav, listadoMovimientos);
        await test.step('Then: llenar teléfono y enviar', async () => {
            const popup = await listadoMovimientos.enviarWhatsAppDesdeLista(DATOS_CONTACTO.TELEFONO);
            expect(popup).toBeTruthy();
        });
    });

    test('SC-04: Enviar movimiento por Email @MS-08.4', async ({
                                                         movimientosNav,
                                                         listadoMovimientos,
                                                     }) => {
        await navegarAIngresosYAbrirAccionesImpresion(movimientosNav, listadoMovimientos);
        await test.step('When: enviar por Email', async () => {
            await listadoMovimientos.enviarEmailDesdeLista(DATOS_CONTACTO.EMAIL);
        });
        await test.step('Then: cerrar modal', async () => {
            await listadoMovimientos.cerrarModal();
        });
    });

    test('SC-05: Descargar PDF de movimiento @MS-08.5', async ({
                                                         movimientosNav,
                                                         listadoMovimientos,
                                                     }) => {
        await navegarAIngresosYAbrirAccionesImpresion(movimientosNav, listadoMovimientos, true);
        await test.step('Then: verificar que se descarga el PDF', async () => {
            const download = await listadoMovimientos.descargarPDFDesdeLista();
            expect(download).toBeTruthy();
        });
    });
});
