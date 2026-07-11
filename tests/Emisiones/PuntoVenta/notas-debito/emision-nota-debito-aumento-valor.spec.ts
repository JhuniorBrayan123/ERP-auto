import { test, expect } from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import { EmitirComprobanteOrigen } from '@screenplay/tasks/common/EmitirComprobanteOrigen';
import { CrearNotaDebitoConVinculacion } from '@screenplay/tasks/notas-debito/CrearNotaDebitoConVinculacion';
import { ModalPostEmisionVisible } from '@screenplay/questions/notas/ModalPostEmisionVisible';
import { CLIENTES, ITEMS_PV } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('ND-01 | Aumento en el Valor', {tag: ['@puntoventa', '@nota-debito']}, () => {

  test('SC-01: Emitir ND por aumento en el valor desde boleta @ND-01.1', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: 'BOLETA',
        cliente: CLIENTES.PERSONA_DNI,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    const resultado = await facturador.realizaYObtiene(
      CrearNotaDebitoConVinculacion({
        tipoDocumento: 'Boleta',
        serie: origen.serie,
        correlativo: origen.correlativo,
        motivo: 'Aumento en el valor',
        textoMotivo: 'Aumento en el valor por automatización - boleta',
        montoPorItem: '20',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-02: Emitir ND por aumento en el valor desde factura @ND-01.2', async ({ facturador }) => {
    const origen = await facturador.realizaYObtiene(
      EmitirComprobanteOrigen({
        tipoComprobante: 'FACTURA',
        cliente: CLIENTES.EMPRESA_RUC_AUTO,
        item: ITEMS_PV.ITEM_GRAVADO_SIN_CONTROL,
      })
    );

    const resultado = await facturador.realizaYObtiene(
      CrearNotaDebitoConVinculacion({
        tipoDocumento: 'Factura',
        serie: origen.serie,
        correlativo: origen.correlativo,
        motivo: 'Aumento en el valor',
        textoMotivo: 'Aumento en el valor por automatización - factura',
        montoPorItem: '10',
      })
    );

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
  });
});
