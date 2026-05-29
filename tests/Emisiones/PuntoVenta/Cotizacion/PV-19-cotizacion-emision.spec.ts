import {expect, test} from '@playwright/test';
import {Cajero} from '../../../../src/actors/cajero';
import {IniciarVentaEnCaja} from '@task/PuntoVenta/IniciarVentaEnCaja';
import {SeleccionarTipoComprobante} from '@task/PuntoVenta/SeleccionarTipoComprobante.task';
import {SeleccionarCliente} from '@task/PuntoVenta/SeleccionarCliente.task';
import {SeleccionarClienteSinDoc} from '@task/PuntoVenta/SeleccionarClienteSinDoc.task';
import {AgregarItemAlCarrito} from '@task/PuntoVenta/AgregarItemAlCarrito.task';
import {EmitirCotizacion} from '@task/PuntoVenta/EmitirCotizacion.task';
import {ModalPostEmision} from '@question/PuntoVenta/ModalPostEmision.question';
import {BitacoraComprobante} from '@question/PuntoVenta/BitacoraComprobante.question';
import {CLIENTES, ITEMS_PV, TIPOS_COMPROBANTE} from '@helpers/PuntoVenta/emision-data.helper';
import {IncrementarCantidadCarrito} from "../../../../src/interactions/PuntoVenta/IncrementarCantidadCarrito";

test.describe('PV-19: Emisión de Cotización Básica', {tag: ['@punto-venta', '@cotizacion', '@emision']}, () => {

    test.beforeEach(async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('C1: Emitir cotización con cliente registrado @PV-19.1', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            SeleccionarCliente(CLIENTES.EMPRESA_RUC_AUTO),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIMPLE),
            EmitirCotizacion()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        
        expect(await cajero.pregunta(BitacoraComprobante.noMuestraDescargoInventario())).toBe(true);
    });

    test('C2: Emitir cotización con cliente sin documento @PV-19.2', async ({page}) => {
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

    test('C5: No permitir emitir cotización sin productos @PV-19.3', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            EmitirCotizacion()
        );

        await expect(page.getByText('No puedes realizar un pago porque no tienes ítems seleccionados')).toBeVisible({timeout: 5000});
    });

    test('C6: Emitir cotización con producto sin stock @PV-19.4', async ({page}) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(
            SeleccionarTipoComprobante(TIPOS_COMPROBANTE.COTIZACION),
            AgregarItemAlCarrito(ITEMS_PV.PRODUCTO_SIN_STOCK),
            IncrementarCantidadCarrito(3),
            EmitirCotizacion()
        );

        expect(await cajero.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });
});
