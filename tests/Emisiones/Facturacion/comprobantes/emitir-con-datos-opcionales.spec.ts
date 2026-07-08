import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { BuscarYSeleccionarCliente } from '@screenplay/interactions/facturacion/BuscarYSeleccionarCliente';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { RegistrarDatosOpcionales } from '@screenplay/tasks/facturacion/RegistrarDatosOpcionales';
import { ConfirmarPago } from '@screenplay/interactions/facturacion/ConfirmarPago';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Emitir con Datos Opcionales', () => {

    test('Emite Factura con Orden de Compra y Observaciones', async ({ cajero }) => {
        await cajero.realiza(
            SeleccionarTipoComprobante('FACTURA'),
            BuscarYSeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            RegistrarDatosOpcionales({
                ordenCompra: 'OC-2024-001',
                observaciones: 'Prueba automatizada datos opcionales',
            }),
        );

        const resultado = await cajero.realizaYObtiene(ConfirmarPago('efectivo'));
        expect(resultado.serie).toBe('F001');
        const numero = `${resultado.serie}-${String(resultado.correlativo).padStart(8, '0')}`;
        expect(numero).toMatch(/^F001-\d{8}$/);
    });
});
