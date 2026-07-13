import { test, expect } from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import { EmitirComprobanteOrigen } from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import { VincularComprobante } from '@screenplay/interactions/notas/VincularComprobante';
import { VincularComprobanteTargets } from '@screenplay/targets/common/VincularComprobanteTargets';
import { NotaCreditoTargets } from '@screenplay/targets/notas-credito/NotaCreditoTargets';
import { SeleccionarMotivoNotaCredito } from '@screenplay/interactions/notas/SeleccionarMotivoNotaCredito';
import { LlenarMotivoNotaCredito } from '@screenplay/interactions/notas/LlenarMotivoTexto';
import { ComprobantePage } from '@pages/PuntoVenta/ComprobantePage';
import {
  CampoObligatorioVisible,
  ComprobanteVinculadoObligatorio,
  ErrorDescuentoSinItem,
  ErrorMontoMayorAlDisponible,
} from '@screenplay/questions/notas/ValidacionesNegativas';
import { CLIENTES, ITEMS_PV, TIPOS_DOCUMENTO_ORIGEN, TIPOS_COMPROBANTE } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('NC-06 | Validaciones y Casos Negativos', {tag: ['@puntoventa', '@nota-credito']}, () => {

  test('SC-01: Vincular comprobante: datos del cliente y artículos se cargan automáticamente @NC-06.1', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
        cliente: CLIENTES.EMPRESA_RUC_AUTO,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    await new ComprobantePage(facturador.page).seleccionarNotaCredito();

    await facturador.realiza(
      VincularComprobante({
        tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
        serie: origen.serie,
        correlativo: origen.correlativo,
      })
    );

    await expect(VincularComprobanteTargets.datosComprobanteCargado(facturador.page)).toBeVisible();
    await expect(
      facturador.page.getByText(`${origen.serie} - ${origen.correlativo}`).or(
        facturador.page.getByText(origen.numero)
      )
    ).toBeVisible();
    await expect(facturador.page.getByText(/automatizacionerp2 cliente/i)).toBeVisible();
  });

  test('SC-02: Al vincular comprobante: ítems se cargan en el grid de NC @NC-06.2', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
        cliente: CLIENTES.EMPRESA_RUC_AUTO,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    await new ComprobantePage(facturador.page).seleccionarNotaCredito();

    await facturador.realiza(
      VincularComprobante({
        tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
        serie: origen.serie,
        correlativo: origen.correlativo,
      })
    );

    await VincularComprobanteTargets.btnVincularYCrearNC(facturador.page).click();

    await expect(NotaCreditoTargets.gridItems(facturador.page)).toBeVisible();
    await expect(NotaCreditoTargets.gridItems(facturador.page))
      .toContainText(ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL.nombre);
  });

  test('SC-03: Error: motivo obligatorio al emitir NC @NC-06.3', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
        cliente: CLIENTES.EMPRESA_RUC_AUTO,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    await new ComprobantePage(facturador.page).seleccionarNotaCredito();

    await facturador.realiza(
      VincularComprobante({
        tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
        serie: origen.serie,
        correlativo: origen.correlativo,
      })
    );

    await VincularComprobanteTargets.btnVincularYCrearNC(facturador.page).click();
    await expect(NotaCreditoTargets.gridItems(facturador.page)).toBeVisible();

    await NotaCreditoTargets.btnEmitir(facturador.page).click();

    await facturador.pregunta(CampoObligatorioVisible());
    await expect(NotaCreditoTargets.inputMotivo(facturador.page)).toBeEmpty();
  });

  test('SC-04: Error: comprobante vinculado obligatorio al emitir NC @NC-06.4', async ({ facturador }) => {
    await new ComprobantePage(facturador.page).seleccionarNotaCredito();

    await VincularComprobanteTargets.btnVincularComprobante(facturador.page).click();
    await facturador.page.locator('.v-modal > div').first().click();

    await LlenarMotivoNotaCredito('Motivo para validación de comprobante obligatorio')(facturador.page);

    await NotaCreditoTargets.btnEmitir(facturador.page).click();

    await facturador.pregunta(ComprobanteVinculadoObligatorio());
    await facturador.page.getByRole('button', { name: /aceptar/i }).click();
  });

  test('SC-05: Error: monto de descuento global mayor al disponible @NC-06.5', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
        cliente: CLIENTES.EMPRESA_RUC_AUTO,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    await new ComprobantePage(facturador.page).seleccionarNotaCredito();

    await facturador.realiza(
      VincularComprobante({
        tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
        serie: origen.serie,
        correlativo: origen.correlativo,
      })
    );

    await VincularComprobanteTargets.btnVincularYCrearNC(facturador.page).click();
    await expect(NotaCreditoTargets.gridItems(facturador.page)).toBeVisible();

    await SeleccionarMotivoNotaCredito('Descuento global')(facturador.page);
    await LlenarMotivoNotaCredito('Motivo para validación de monto')(facturador.page);

    const inputMonto = NotaCreditoTargets.inputMonto(facturador.page);
    await inputMonto.click();
    await inputMonto.fill('99999');

    await NotaCreditoTargets.btnEmitir(facturador.page).click();

    await facturador.pregunta(ErrorMontoMayorAlDisponible());
  });

  test('SC-06: Error: descuento por ítem sin aplicar descuento a ningún ítem @NC-06.6', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: TIPOS_COMPROBANTE.BOLETA,
        cliente: CLIENTES.PERSONA_DNI,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    await new ComprobantePage(facturador.page).seleccionarNotaCredito();

    await facturador.realiza(
      VincularComprobante({
        tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.BOLETA,
        serie: origen.serie,
        correlativo: origen.correlativo,
      })
    );

    await VincularComprobanteTargets.btnVincularYCrearNC(facturador.page).click();
    await expect(NotaCreditoTargets.gridItems(facturador.page)).toBeVisible();

    await SeleccionarMotivoNotaCredito('Descuento por ítem')(facturador.page);
    await LlenarMotivoNotaCredito('Motivo sin selección de ítem')(facturador.page);

    await NotaCreditoTargets.btnEmitir(facturador.page).click();

    await facturador.pregunta(ErrorDescuentoSinItem());
    await facturador.page.getByRole('button', { name: /aceptar/i }).click();
  });
});
