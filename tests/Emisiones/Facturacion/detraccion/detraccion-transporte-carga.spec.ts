import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { ConfirmarPago } from '@screenplay/interactions/facturacion/ConfirmarPago';
import { FacturacionTargets } from '@screenplay/targets/facturacion/FacturacionTargets';
import { VentaGridTargets } from '@screenplay/targets/facturacion/VentaGridTargets';
import { DetraccionPage } from '@pages/PuntoVenta/detraccion.page';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { BusquedaComprobantesPage } from '@pages/PuntoVenta/BusquedaComprobantesPage';

const DETRACCION_CHECKBOX_ID = 'pv_punto-venta_cmp-factura-boleta-header_v-switch:documento-detraccion';

test.describe('Facturación — Detracción transporte de carga', () => {

    test('Emite factura con detracción de transporte de carga exitosamente', async ({ page, cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
        );

        await VentaGridTargets.btnIncrementarCantidad(page, 0).click();

        const isChecked = await page.evaluate((id) => {
            const el = document.getElementById(id) as HTMLInputElement;
            return el?.checked ?? false;
        }, DETRACCION_CHECKBOX_ID);

        if (!isChecked) {
            await page.evaluate((id) => {
                const el = document.getElementById(id) as HTMLInputElement;
                if (el && !el.checked) {
                    el.checked = true;
                    el.dispatchEvent(new Event('change', {bubbles: true}));
                }
            }, DETRACCION_CHECKBOX_ID);
            await page.waitForTimeout(500);
        }

        await FacturacionTargets.btnEditarDetraccion(page).click();

        const detraccionPage = new DetraccionPage(page);
        await detraccionPage.configurarTransporteCarga({
            tipoOperacion: 'Transporte de Carga',
            metodoPago: 'Depósito en cuenta',
            porcentaje: '4',
            numeroCuenta: '45-241-45457',
            origen: {
                ubigeo: 'arequip',
                texto: '- Arequipa - Arequipa - Arequipa',
                direccion: 'Av. Arequipa 123',
            },
            destino: {
                ubigeo: 'juliaca',
                texto: '- Juliaca - San Roman - Puno',
                direccion: 'Av. Juliaca 456',
            },
            valorTransporte: '500',
            cargaEfectiva: '3',
            cargaUtil: '20',
            detalleViaje: 'Carga de prueba automatizada',
            tramo: {
                origen: {
                    ubigeo: 'ica',
                    texto: '- Ica - Ica - Ica',
                    direccion: 'Av. Ica 789',
                },
                destino: {
                    ubigeo: 'lima',
                    texto: '- Lima - Lima - Lima',
                    direccion: 'Av. Lima 012',
                },
                configuracionVehicular: 'estándar',
                cargaUtilMetricasVehiculo: '23',
                descripcionTramo: 'Tramo automatizado',
                cargaEfectivaToneladas: '2.6',
                valorTransporte: '1000',
                valorReferencialTonelada: '2.5',
                valorPreliminarCargaUtilNominal: '5.3',
            },
        });

        const resultado = await cajero.realizaYObtiene(ConfirmarPago('efectivo'));

        await expect(FacturacionTargets.mensajeExito(page)).toBeVisible({timeout: 15_000});
        await FacturacionTargets.btnNuevaVenta(page).click();

        const busqueda = new BusquedaComprobantesPage(page);
        const estadoSunat = await test.step('And: validar estado SUNAT desde API de Consultas', async () => {
            return await busqueda.validarEstadoSunat();
        });

        await busqueda.navegarABusquedaComprobantes(resultado);
        await busqueda.abrirBitacoraDelPrimerComprobante();
        await busqueda.validarComprobanteEmitido(estadoSunat);
        await busqueda.validarDescargoInventarios();
        await busqueda.cerrarBitacora();
    });
});
