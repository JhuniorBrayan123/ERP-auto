import { test, expect } from '@fixtures/PuntoVenta/facturacion.fixture';
import { BuscarYAgregarProducto } from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import { ProductoEnGrilla } from '@screenplay/questions/facturacion/ProductoEnGrilla';
import { ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('Facturación — Buscar y agregar producto', () => {

    test('Busca un producto por código y aparece en la grilla', async ({ cajero }) => {
        await cajero.realiza(
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)
        );

        const enGrilla = await cajero.pregunta(
            ProductoEnGrilla(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre)
        );
        expect(enGrilla).toBe(true);
    });

    test('Agrega múltiples productos a la grilla', async ({ cajero }) => {
        await cajero.realiza(
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            BuscarYAgregarProducto(ITEMS_PV.ITEM_EQUIVALENTE),
        );

        const primeroEnGrilla = await cajero.pregunta(ProductoEnGrilla(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre));
        const segundoEnGrilla = await cajero.pregunta(ProductoEnGrilla(ITEMS_PV.ITEM_EQUIVALENTE.nombre));

        expect(primeroEnGrilla).toBe(true);
        expect(segundoEnGrilla).toBe(true);
    });
});
