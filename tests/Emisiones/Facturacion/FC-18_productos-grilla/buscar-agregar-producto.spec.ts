import {expect, test} from '@fixtures/PuntoVenta/facturacion.fixture';
import {BuscarYAgregarProducto} from '@screenplay/interactions/facturacion/BuscarYAgregarProducto';
import {ProductoEnGrilla} from '@screenplay/questions/facturacion/ProductoEnGrilla';
import {ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';
import {BuscarYAgregarEquivalencia} from "@task/PuntoVenta/BuscarYAgregarEquivalencia.task";
import {FacturacionTargets} from "@screenplay/targets/facturacion/FacturacionTargets";


test.describe('FC-14 | Buscar y agregar producto', {tag: ['@facturacion', '@productos']}, () => {

    test('SC-01: Buscar un producto por código y aparece en la grilla @FC-14.1', async ({cajero}) => {
        await cajero.realiza(
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL)
        );

        const enGrilla = await cajero.pregunta(
            ProductoEnGrilla(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre)
        );
        expect(enGrilla).toBe(true);
    });

    test('SC-02: Agregar múltiples productos a la grilla @FC-14.2', async ({cajero, page}) => {
        await cajero.realiza(
            BuscarYAgregarProducto(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL),
            BuscarYAgregarEquivalencia(ITEMS_PV.ITEM_EQUIVALENTE, 'Equivalente X2'),
        );

        await FacturacionTargets.btnCerrarModal(page).click();
        const primeroEnGrilla = await cajero.pregunta(ProductoEnGrilla(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre));
        const segundoEnGrilla = await cajero.pregunta(ProductoEnGrilla('Equivalente X2'));

        expect(primeroEnGrilla).toBe(true);
        expect(segundoEnGrilla).toBe(true);
    });
});
