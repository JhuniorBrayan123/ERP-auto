import { test, expect } from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import { EmitirComprobanteOrigen } from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import { CrearNotaCreditoConVinculacion } from '@screenplay/tasks/notas-credito/CrearNotaCreditoConVinculacion';
import { ModalPostEmisionVisible } from '@screenplay/questions/notas/ModalPostEmisionVisible';
import { CLIENTES, ITEMS_PV, TIPOS_DOCUMENTO_ORIGEN, TIPOS_COMPROBANTE } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('NC-02 | Motivos con Monto Directo', {tag: ['@puntoventa', '@nota-credito']}, () => {

  test('SC-01: Emitir NC por descuento global desde factura @NC-02.1', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
        cliente: CLIENTES.EMPRESA_RUC_AUTO,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    const resultado = await facturador.realizaYObtiene(
      CrearNotaCreditoConVinculacion({
        vinculacion: {
          tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
          serie: origen.serie,
          correlativo: origen.correlativo,
        },
        motivo: 'Descuento global',
        textoMotivo: 'Descuento global por automatización',
        monto: '5',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-02: Emitir NC por disminución en el valor desde factura @NC-02.2', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: TIPOS_COMPROBANTE.FACTURA,
        cliente: CLIENTES.EMPRESA_RUC_AUTO,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    const resultado = await facturador.realizaYObtiene(
      CrearNotaCreditoConVinculacion({
        vinculacion: {
          tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.FACTURA,
          serie: origen.serie,
          correlativo: origen.correlativo,
        },
        motivo: 'Disminución en el valor',
        textoMotivo: 'Disminución en el valor por automatización',
        monto: '5',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-03: Emitir NC por otros conceptos desde boleta @NC-02.3', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: TIPOS_COMPROBANTE.BOLETA,
        cliente: CLIENTES.PERSONA_DNI,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    const resultado = await facturador.realizaYObtiene(
      CrearNotaCreditoConVinculacion({
        vinculacion: {
          tipoDocumento: TIPOS_DOCUMENTO_ORIGEN.BOLETA,
          serie: origen.serie,
          correlativo: origen.correlativo,
        },
        motivo: 'Otros Conceptos',
        textoMotivo: 'Otros conceptos por automatización',
        monto: '5',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });
});
