import {test, expect} from '@fixtures/PuntoVenta/guias-fixture';
import {EmitirGuiaRemitenteTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitente.task';
import {EmitirGuiaRemitenteConValidacionTask} from '@task/PuntoVenta/guias-remision/EmitirGuiaRemitenteConValidacion.task';
import {GuiaRemitentePage} from '@pages/PuntoVenta/guias-remision/GuiaRemitentePage';
import {GUIAS_DATA} from '@helpers/PuntoVenta/guias-data.helper';
import {NavegarAGuiaRemitente} from '@task/PuntoVenta/guias-remision/NavegarAGuiaRemitente.task';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';

test.describe('Guías de Remisión Remitente - Mercancía Extranjera', { tag: ['@guias', '@puntoventa'] }, () => {
    test.beforeEach(async ({ cajero }) => {
        await cajero.intentaRealizar(
            IniciarVentaEnCaja('caja-auto'),
            NavegarAGuiaRemitente()
        );
    });

    test('GRR-10: Emitir guía por traslado de mercancía extranjera sin contenedor', async ({ cajero, listadoGuiasPage }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.TRASLADO_BIENES_TRANSFORMACION, // Note: en GRR-10 usaba TRASLADO_BIENES_TRANSFORMACION
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ]
            })
        );
        await listadoGuiasPage.validarGuiaEmitidaExito();
    });

    test('GRR-11: Emitir guía por traslado de mercancía extranjera con contenedor', async ({ cajero, listadoGuiasPage }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.TRASLADO_MERCANCIA_EXTRANJERA,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                dam: '2024/124-4567-10-12345',
                bultos: '10',
                contenedorNumero: '1',
                contenedorPrecinto: '1',
                peso: '1',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ])
            );
        });
    
        await listadoGuiasPage.validarGuiaEmitidaExito();
    });

    test('GRR-12: Emitir guía con traslado de vehículos categoría M1 o L', async ({ cajero, listadoGuiasPage }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.VENTA,
                trasladoVehiculosM1: true,
                skipConductor: true,
                skipTransportista: true,
                peso: '10',
                items: [
                    { codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo }
                ]
            })
        );
        await listadoGuiasPage.validarGuiaEmitidaExito();
    });

    test('GRR-13: Validar datos obligatorios de traslado de mercancía extranjera', async ({ cajero, page }) => {
        await cajero.intentaRealizar(
            EmitirGuiaRemitenteConValidacionTask({
                motivo: GUIAS_DATA.MOTIVOS_TRASLADO.TRASLADO_MERCANCIA_EXTRANJERA,
                modalidad: GUIAS_DATA.MODALIDADES.PUBLICA,
                peso: '10',
                items: [
                    {codigoONombre: GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_FLEXIBLE.codigo}
                ]
            })
        );
        await expect(page.getByRole('textbox', { name: '2024/123-4567-10|20|21|30|36|' })).toBeEmpty();
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByRole('textbox', { name: 'Ej. 10' })).toBeEmpty();
    });

    test('GRR-14: Validar contenedor y precinto obligatorios', async ({ cajero, page }) => {
        const guiaPage = new GuiaRemitentePage(page);

        await guiaPage.seleccionarMotivo(GUIAS_DATA.MOTIVOS_TRASLADO.TRASLADO_MERCANCIA_EXTRANJERA);
        await guiaPage.seleccionarModalidad(GUIAS_DATA.MODALIDADES.PUBLICA);
        await guiaPage.completarDam('2024/124-4567-30-12345');
        await guiaPage.seleccionarDestinatarioSiAplica(
            GUIAS_DATA.DESTINATARIO.RUC,
            GUIAS_DATA.DESTINATARIO.NOMBRE_RUC
        );
        await guiaPage.completarPuntoPartidaYLlegada(
            GUIAS_DATA.MERCANCIA_EXTRANJERA.UBIGEO_PARTIDA,
            GUIAS_DATA.MERCANCIA_EXTRANJERA.UBIGEO_LLEGADA,
            GUIAS_DATA.REMITENTE.DIRECCION,
            GUIAS_DATA.DESTINATARIO.DIRECCION
        );
        await guiaPage.seleccionarTransportista(GUIAS_DATA.TRANSPORTISTA.RUC);
        await guiaPage.completarMTC(GUIAS_DATA.TRANSPORTISTA.MTC);
        await guiaPage.buscarYSeleccionarItem(GUIAS_DATA.ITEMS.PRODUCTO_GRAVADO_SIN_CONTROL.codigo);
        await guiaPage.definirPesoTotal('Kg', '10');

        // Activar contenedor pero dejar campos vacíos
        await guiaPage.activarContenedorSinDatos();

        await guiaPage.emitirGuia();

        await expect(page.getByRole('main')).toContainText('Campo obligatorio');
        await expect(page.getByText('Contenedor 1', {exact: true})).toBeVisible();
        await expect(page.getByText('Precinto 1', {exact: true})).toBeVisible();
        await expect(page.getByText('Campo obligatorio').first()).toBeVisible();
        await expect(page.getByText('Campo obligatorio').nth(1)).toBeVisible();
    });
});
