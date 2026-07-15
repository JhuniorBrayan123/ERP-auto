import { test, expect } from '@fixtures/PuntoVenta/cotizacion-pedido.fixture';
import { CrearPedidoVF } from '@screenplay/tasks/pedido/CrearPedidoVF';
import { ModalPostEmision } from '@question/PuntoVenta/ModalPostEmision.question';
import { BitacoraComprobante } from '@question/PuntoVenta/BitacoraComprobante.question';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';
import { SeleccionarTipoComprobante } from '@screenplay/interactions/facturacion/SeleccionarTipoComprobante';
import { PedidoTargets } from '@screenplay/targets/pedido/PedidoTargets';
import { AccionesPostEmisionCompletas } from '@question/PuntoVenta/AccionesPostEmisionCompletas.question';
import { IntentarDescargarXml } from '@task/PuntoVenta/IntentarDescargarXml.task';
import { MensajeVisible } from '@question/PuntoVenta/MensajeVisible';

test.describe('FC-PD-EMISION | Emisión de Pedido desde Vista Facturación', {
    tag: ['@facturacion', '@pedido', '@emision']
}, () => {

    test('SC-01: Registrar pedido con cliente registrado @FC-PD.1', async ({ vendedor }) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                observaciones: 'Pedido auto — cliente DNI',
            })
        );

        expect(resultado.numero).toMatch(/^PD\d{2}-\d{8}$/);
        expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await vendedor.pregunta(ModalPostEmision.tieneCorrelativo())).toBe(true);
    });

    test('SC-02: Pedido no afecta stock (no descargo inventario) @FC-PD.2', async ({ vendedor }) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
            })
        );

        expect(resultado.numero).toMatch(/^PD\d{2}-\d{8}$/);
        
        const mockEmisionResult = { current: { serie: resultado.serie, correlativo: resultado.correlativo, comprobanteId: 0 } };
        expect(await vendedor.pregunta(
            BitacoraComprobante.noMuestraDescargoInventario(mockEmisionResult)
        )).toBe(true);
    });

    test('SC-02B: Pedido con productos sin stock se registra correctamente', async ({ vendedor }) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.PRODUCTO_SIN_STOCK],
            })
        );
        expect(resultado.numero).toMatch(/^PD\d{2}-\d{8}$/);
        expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });

    test('SC-03: Registrar pedido con cliente sin documento @FC-PD.3', async ({ vendedor }) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                items: [ITEMS_PV.PRODUCTO_SIMPLE],
                clienteSinDoc: { nombre: 'cliente pedido sin doc', direccion: 'Arequipa' },
            })
        );

        expect(resultado.numero).toMatch(/^PD\d{2}-\d{8}$/);
        expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);
    });

    test('SC-04: No permite emitir pedido sin productos @FC-PD.4', async ({ vendedor, page }) => {
        await vendedor.realiza(
            SeleccionarTipoComprobante('PEDIDO'),
        );

        await PedidoTargets.btnEmitir(page).click();
        await expect(PedidoTargets.mensajeSinItems(page)).toBeVisible({ timeout: 5_000 });
    });

    test('SC-05: Validar que pedido no genera comprobante electrónico @FC-PD.5', async ({ vendedor }) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                observaciones: 'Pedido auto — validar no XML',
            })
        );

        expect(resultado.numero).toMatch(/^PD\d{2}-\d{8}$/);
        expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);

        await vendedor.realiza(IntentarDescargarXml());
        expect(await vendedor.pregunta(MensajeVisible('Este tipo de comprobante no genera XML'))).toBe(true);
    });

    test('SC-06: Validar acciones disponibles después de registrar pedido @FC-PD.6', async ({ vendedor }) => {
        const resultado = await vendedor.realizaYObtiene(
            CrearPedidoVF({
                cliente: CLIENTES.PERSONA_DNI,
                items: [ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL],
                observaciones: 'Pedido auto — validar acciones',
            })
        );

        expect(resultado.numero).toMatch(/^PD\d{2}-\d{8}$/);
        expect(await vendedor.pregunta(ModalPostEmision.estaVisible())).toBe(true);
        expect(await vendedor.pregunta(AccionesPostEmisionCompletas())).toBe(true);
    });
});
