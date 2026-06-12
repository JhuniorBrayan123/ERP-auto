import {expect, test} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaRemitenteTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitente.task';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaRemitente} from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {capturarSaldoAnterior, verificarStockSinCambio} from '@helpers/PuntoVenta/verificaciones-pv.helper';

test.describe('Guías de Remisión Remitente - Emisión General', {tag: ['@guias', '@puntoventa']}, () => {
    test.beforeEach(async ({cajero}) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaRemitente()
        );
    });

    test('GRR-01: Emitir guía con modalidad pública', async ({cajero, listadoGuiasPage, kardexApi}) => {
        const saldoAntes = await capturarSaldoAnterior(
            kardexApi,
            GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo
        );
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '1',
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo}
                ]
            })
        );
        await test.step('Verificar que la guía se emite exitosamente', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
            await listadoGuiasPage.validarElementosDeEnvioVisibles();
        });
        await verificarStockSinCambio(
            kardexApi,
            GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo,
            saldoAntes
        );
    });

    test('Emitir guía donde el destinatario es el mismo emisor @GRR-03a', async ({cajero, listadoGuiasPage, page}) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteTask({
                tipoOperacion: 'COMPRA',
                modalidad: 'PRIVADA',
                peso: '10.42',
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo}
                ],
                proveedorDocumento: GUIAS_DATA.DESTINATARIO.DNI,
                puntoPartida: GUIAS_DATA.REMITENTE.UBIGEO,
                puntoLlegada: GUIAS_DATA.DESTINATARIO.UBIGEO,
                direccionPartida: GUIAS_DATA.REMITENTE.DIRECCION,
            })
        );

        await test.step('Verificar que la guía se emite exitosamente', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
            await expect(page.getByText(/[A-Z]\d{3,4}-/)).toBeVisible();
            await listadoGuiasPage.validarElementosDeEnvioVisibles();
        });
    });

    test('GRR-06: Guardar guía en modalidad privada (borrador)', async ({cajero, listadoGuiasPage}) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA,
                modalidad: GUIAS_DATA.MODALIDADES.PRIVADA,
                peso: '10',
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.nombre}
                ],
                guardarEnVezDeEmitir: true
            })
        );

        await test.step('Verificar que la guía se guardó exitosamente', async () => {
            await listadoGuiasPage.validarGuiaGuardadaExito();
        });
    });
});
