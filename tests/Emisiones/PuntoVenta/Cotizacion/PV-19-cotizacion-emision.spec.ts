import { test, expect } from '@fixtures/PuntoVenta/emision-fixture';
import { Cajero } from '../../../../src/actors/cajero';
import { IniciarVentaEnCaja } from '@task/PuntoVenta/IniciarVentaEnCaja';
import { SeleccionarTipoComprobante } from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import { SeleccionarCliente } from '@task/PuntoVenta/SeleccionarCliente.task';
import { SeleccionarClienteSinDoc } from '@task/PuntoVenta/SeleccionarClienteSinDoc.task';
import { AgregarItemAlCarrito } from '@task/PuntoVenta/AgregarItemAlCarrito.task';
import { EmitirCotizacion } from '@task/PuntoVenta/EmitirCotizacion.task';
import { ModalPostEmision } from '@question/PuntoVenta/ModalPostEmision.question';
import { BitacoraComprobante } from '@question/PuntoVenta/BitacoraComprobante.question';
import { TIPOS_COMPROBANTE, CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('PV-19: Emisión de Cotización Básica', () => {
    test.beforeEach(async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('C1: Emitir cotización con cliente registrado', async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            SeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            EmitirCotizacion()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
        expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario())).toBe(true);
    });

    test('C2: Emitir cotización con cliente sin documento', async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            SeleccionarClienteSinDoc(CLIENTES.CONSUMIDOR_FINAL),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            EmitirCotizacion()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await cajero.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
    });

    test('C5: No permitir emitir cotización sin productos', async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            EmitirCotizacion()
        );

        await expect(page.getByText('No hay productos en el comprobante')).toBeVisible({ timeout: 5000 });
    });

    test('C6: Emitir cotización con producto sin stock', async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIN_STOCK),
            EmitirCotizacion()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });
});
