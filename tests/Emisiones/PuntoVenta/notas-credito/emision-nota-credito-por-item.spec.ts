import { test, expect } from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import { EmitirComprobanteOrigen } from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import { CrearNotaCreditoConVinculacion } from '@screenplay/tasks/notas-credito/CrearNotaCreditoConVinculacion';
import { ModalPostEmisionVisible } from '@screenplay/questions/notas/ModalPostEmisionVisible';
import { CLIENTES, ITEMS_PV, TIPOS_DOCUMENTO_ORIGEN, TIPOS_COMPROBANTE } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('NC-03 | Motivos por Ítem', {tag: ['@puntoventa', '@nota-credito']}, () => {

  test('SC-01: Emitir NC por descuento por ítem desde boleta @NC-03.1', async ({ facturador }) => {
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
        motivo: 'Descuento por ítem',
        textoMotivo: 'Descuento por ítem por automatización',
        devolucionPorItem: true,
        nuevoDescuento: '5',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-02: Emitir NC por corrección de descripción desde boleta @NC-03.2', async ({ facturador }) => {
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
        motivo: 'Corrección por error en la descripción',
        textoMotivo: 'Corrección de descripción por automatización',
        devolucionPorItem: true,
        nuevaDescripcion: 'Nueva descripción editada por test automatizado',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-03: Emitir NC por bonificación desde boleta @NC-03.3', async ({ facturador }) => {
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
        motivo: 'Bonificación',
        textoMotivo: 'Bonificación por automatización',
        devolucionPorItem: true,
        cantidadBonificar: '2',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-04: Emitir NC por devolución por ítem SIN retorno de stock desde factura @NC-03.4', async ({ facturador }) => {
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
        motivo: 'Devolución por ítem',
        textoMotivo: 'Devolución por ítem sin retorno de stock por automatización',
        retornoStock: false,
        devolucionPorItem: true,
        cantidadDevolver: '1',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });
});
