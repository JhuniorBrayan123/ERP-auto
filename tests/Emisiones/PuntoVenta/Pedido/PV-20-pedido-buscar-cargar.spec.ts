import { test, expect } from '@fixtures/PuntoVenta/emision-fixture';
import { Cajero } from '../../../../src/actors/cajero';
import { IniciarVentaEnCaja } from '@task/PuntoVenta/IniciarVentaEnCaja';
import { CargarPedidoDesdeLista } from '@task/PuntoVenta/CargarPedidoDesdeLista.task';
import { DatosPedidoCargado } from '@question/PuntoVenta/DatosPedidoCargado.question';

test.describe('PV-20: Búsqueda y carga de pedidos', () => {
    test.beforeEach(async ({ page }) => {
        const cajero = Cajero.con(page);
        await cajero.intentaRealizar(IniciarVentaEnCaja());
    });

    test('P5: Cargar pedido emitido previamente', async ({ page }) => {
        const cajero = Cajero.con(page);
        const numPedido = '13';

        await cajero.intentaRealizar(
            CargarPedidoDesdeLista(numPedido)
        );

        expect(await cajero.pregunta(DatosPedidoCargado.contieneReferencia(`Pedido`))).toBe(true);
        expect(await cajero.pregunta(DatosPedidoCargado.contieneMonto(`S/ `))).toBe(true);
    });
});
