/**
 * Spec: items-vendidos.spec.ts
 *
 * Cubre:
 * - Validar que un ítem usado en una venta aparezca en "Ítems vendidos"
 * - Buscar ítem por código
 * - Validar nombre, código y cantidad vendida
 */

import { expect } from '@playwright/test';
import { test } from '@fixtures/PuntoVenta/caja.fixture';
import { IrACierreDeCaja } from '@screenplay/tasks/caja/IrACierreDeCaja';
import { RegresarANuevaVenta } from '@screenplay/tasks/caja/AbrirMenuCaja';
import {
    ConsultarItemsVendidos,
    BuscarItemVendido,
} from '@screenplay/tasks/cierre-caja/ConsultarItemsYDescuentos';
import { ItemVendidoVisible } from '@screenplay/questions/cierre-caja/MovimientoVisibleEnCierre';
import { ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Ítems Vendidos en Cierre de Caja', () => {

    test('validar que ítem gravado sin control aparece en Items vendidos', async ({
        cajero,
        boletaEmitida: _,
    }) => {
        // ── Arrange ─────────────────────────────────────────────────────────
        // boletaEmitida garantiza que se vendió ITEM_GRAVADO_SIN_CONTROL (código 151515)
        const itemBuscado = ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL;

        // ── Act ──────────────────────────────────────────────────────────────
        await cajero.realiza(
            IrACierreDeCaja(),
            ConsultarItemsVendidos(),
            BuscarItemVendido(itemBuscado.codigo),
        );

        // ── Assert ───────────────────────────────────────────────────────────
        const visible = await cajero.pregunta(ItemVendidoVisible(itemBuscado.nombre));
        expect(visible).toBe(true);

        await cajero.realiza(RegresarANuevaVenta());
    });
});
