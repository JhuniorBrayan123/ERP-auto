import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaRemitenteTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitente.task';
import {EmitirGuiaRemitenteConValidacionTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitenteConValidacion.task';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaRemitente} from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {capturarSaldoAnterior, verificarStockSinCambio} from '@helpers/PuntoVenta/verificaciones-pv.helper';

test.describe('Guías de Remisión Remitente - Exportación', { tag: ['@guias', '@puntoventa'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaRemitente()
        );
    });

    test('GRR-02: Emitir guía por exportación (Modalidad Pública)', async ({ cajero, listadoGuiasPage, kardexApi }) => {
        const saldoAntes = await capturarSaldoAnterior(
            kardexApi,
            GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo
        );

        await cajero.intentaRealizar(
            EmitirGuiaRemitenteTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.EXPORTACION,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '10',
                esExportacion: true,
                dam: '2025/123-4567-40-12345',
                bultos: '10',
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo}
                ]
            })
        );

        await test.step('Verificar que la guía de exportación se emite exitosamente', async () => {
            await listadoGuiasPage.validarGuiaEmitidaExito();
        });

        await verificarStockSinCambio(
            kardexApi,
            GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo,
            saldoAntes
        );
    });

    test('GRR-03: Validar datos obligatorios de exportación', async ({ cajero, page }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.EXPORTACION,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ]
            })
        );
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByText('Campo obligatorio').first()).toBeVisible();
        await expect(page.getByText('Campo obligatorio').nth(1)).toBeVisible();
    });
});
