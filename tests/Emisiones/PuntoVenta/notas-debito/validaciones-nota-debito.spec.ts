import {expect, test} from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import {EmitirComprobanteOrigen} from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import {NotaDebitoTargets} from '@screenplay/targets/notas-debito/NotaDebitoTargets';
import {SeleccionarMotivoNotaDebito} from '@screenplay/interactions/notas/SeleccionarMotivoNotaDebito';
import {LlenarMotivoNotaDebito} from '@screenplay/interactions/notas/LlenarMotivoTexto';
import {ComprobantePage} from '@pages/PuntoVenta/ComprobantePage';
import {
  CampoObligatorioVisible,
  ComprobanteNoEncontrado,
  ErrorMontoVisible,
  GrillaItemsVacia,
} from '@screenplay/questions/notas/ValidacionesNegativas';
import {CLIENTES, ITEMS_PV} from '@helpers/PuntoVenta/emision-data.helper';

test.describe('ND-04 | Validaciones y Casos Negativos', {tag: ['@puntoventa', '@nota-debito']}, () => {

    test('SC-01: Error: comprobante vinculado es obligatorio al emitir ND @ND-04.1', async ({facturador}) => {
        await new ComprobantePage(facturador.page).seleccionarNotaDebito();

        await SeleccionarMotivoNotaDebito('Intereses por mora')(facturador.page);
        await LlenarMotivoNotaDebito('Motivo sin comprobante vinculado')(facturador.page);

        const inputMonto = NotaDebitoTargets.inputMonto(facturador.page);
        await inputMonto.click();
        await inputMonto.fill('10');

        await NotaDebitoTargets.btnEmitir(facturador.page).click();

        await facturador.pregunta(CampoObligatorioVisible());
    });

    test('SC-02: Error: motivo es obligatorio al emitir ND @ND-04.2', async ({facturador}) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: 'FACTURA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
            })
        );

        await new ComprobantePage(facturador.page).seleccionarNotaDebito();

        await facturador.page.locator('div').filter({hasText: /^Factura$/}).nth(2).click();
        await facturador.page.getByText('Factura').nth(2).click();

        const inputSerie = facturador.page.locator('div').filter({hasText: new RegExp(`^${origen.serie}$`)}).nth(3);
        await inputSerie.click();
        await facturador.page.getByText(origen.serie).nth(1).click();

        const inputCorrelativo = NotaDebitoTargets.inputCorrelativo(facturador.page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(origen.correlativo);
        await NotaDebitoTargets.btnBuscar(facturador.page).click();

        await expect(NotaDebitoTargets.gridItems(facturador.page)).toBeVisible();

        await SeleccionarMotivoNotaDebito('Intereses por mora')(facturador.page);

        const inputMonto = NotaDebitoTargets.inputMonto(facturador.page);
        await inputMonto.click();
        await inputMonto.fill('10');

        await NotaDebitoTargets.btnEmitir(facturador.page).click();
        await facturador.pregunta(CampoObligatorioVisible());
    });

    test('SC-03: Error: monto vacío en ND por aumento en el valor @ND-04.3', async ({facturador}) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: 'BOLETA',
                cliente: CLIENTES.PERSONA_DNI,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
            })
        );

        await new ComprobantePage(facturador.page).seleccionarNotaDebito();

        await facturador.page.locator('div').filter({hasText: /^Factura$/}).nth(2).click();
        await facturador.page.getByText('Boleta', {exact: true}).click();

        const inputSerie = facturador.page.locator('div').filter({hasText: new RegExp(`^${origen.serie}$`)}).nth(3);
        await inputSerie.click();
        await facturador.page.getByText(origen.serie).nth(1).click();

        const inputCorrelativo = NotaDebitoTargets.inputCorrelativo(facturador.page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(origen.correlativo);
        await NotaDebitoTargets.btnBuscar(facturador.page).click();

        await expect(NotaDebitoTargets.gridItems(facturador.page)).toBeVisible();

        await SeleccionarMotivoNotaDebito('Aumento en el valor')(facturador.page);
        await LlenarMotivoNotaDebito('Motivo sin monto')(facturador.page);

        await NotaDebitoTargets.btnEmitir(facturador.page).click();

        await facturador.pregunta(ErrorMontoVisible());

        await facturador.page.getByRole('button', {name: /aceptar/i}).click();
    });

    test('SC-04: Error: comprobante no encontrado con correlativo inexistente @ND-04.4', async ({facturador}) => {
        await new ComprobantePage(facturador.page).seleccionarNotaDebito();

        await facturador.page.locator('div').filter({hasText: /^Factura$/}).nth(2).click();
        await facturador.page.getByText('Boleta', {exact: true}).click();

        await facturador.page.locator('div').filter({hasText: /^B001$/}).nth(3).click();
        await facturador.page.getByText('B001').nth(1).click();

        const inputCorrelativo = NotaDebitoTargets.inputCorrelativo(facturador.page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill('98452513');
        await NotaDebitoTargets.btnBuscar(facturador.page).click();

        await facturador.pregunta(ComprobanteNoEncontrado());
    });

    test('SC-05: Eliminar comprobante vinculado limpia los ítems del grid @ND-04.5', async ({facturador}) => {
        const origen = await facturador.realizaYObtiene(
            EmitirComprobanteOrigen({
                tipoComprobante: 'FACTURA',
                cliente: CLIENTES.EMPRESA_RUC_AUTO,
                item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
            })
        );
        await new ComprobantePage(facturador.page).seleccionarNotaDebito();
        await facturador.page.locator('div').filter({hasText: /^Factura$/}).nth(2).click();
        await facturador.page.getByText('Factura').nth(2).click();
        await facturador.page.locator('div').filter({hasText: new RegExp(`^${origen.serie}$`)}).nth(2).click();
        await facturador.page.getByText(origen.serie).nth(1).click();
        const inputCorrelativo = NotaDebitoTargets.inputCorrelativo(facturador.page);
        await inputCorrelativo.click();
        await inputCorrelativo.fill(origen.correlativo);
        await NotaDebitoTargets.btnBuscar(facturador.page).click();
        await expect(NotaDebitoTargets.gridItems(facturador.page)).toBeVisible();
        await NotaDebitoTargets.btnEliminarComprobanteVinculado(facturador.page).click();
        await facturador.pregunta(GrillaItemsVacia());
    });
});
