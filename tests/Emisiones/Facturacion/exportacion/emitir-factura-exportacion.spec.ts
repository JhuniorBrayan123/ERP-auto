import {expect, test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {SeleccionarTipoComprobante} from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import {BuscarYSeleccionarCliente} from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {ConfirmarPago} from '@screenplay/interactions/facturacion/ConfirmarPago';
import {FacturacionTargets} from '@screenplay/targets/facturacion/FacturacionTargets';
import {CLIENTE_EXTRANJERIA_NC_EXPORTACION, CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BusquedaComprobantesPage} from '@pages/PuntoVenta/BusquedaComprobantesPage';

test.describe('Facturación — Emitir Factura de Exportación', () => {

    test('Emite Factura de Exportación con cliente Extranjería', async ({page, cajero}) => {
        const clienteExportacion = {
            tipoDocumento: CLIENTE_EXTRANJERIA_NC_EXPORTACION.tipoDocumento,
            documento: CLIENTE_EXTRANJERIA_NC_EXPORTACION.numeroDocumento,
            nombre: CLIENTE_EXTRANJERIA_NC_EXPORTACION.nombre,
        };

        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
        );

        await FacturacionTargets.sliderExportacion(page).click();
        await page.waitForLoadState('networkidle').catch(() => {
        });

        await cajero.realiza(
            BuscarYSeleccionarCliente(clienteExportacion),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
        );

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

    test('Emite Factura de Exportación con cliente sin RUC (Carnet Extranjería)', async ({page, cajero}) => {
        const clienteSinRuc = {
            tipoDocumento: CLIENTES.PERSONA_EXTRANJERIA.tipoDocumento,
            documento: CLIENTES.PERSONA_EXTRANJERIA.documento,
            nombre: CLIENTES.PERSONA_EXTRANJERIA.nombre,
        };

        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
        );

        await FacturacionTargets.sliderExportacion(page).click();
        await page.waitForLoadState('networkidle').catch(() => {
        });

        await cajero.realiza(
            BuscarYSeleccionarCliente(clienteSinRuc),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
        );

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
