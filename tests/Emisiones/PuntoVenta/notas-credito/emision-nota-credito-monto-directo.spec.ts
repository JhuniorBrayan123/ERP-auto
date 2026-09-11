import { test, expect } from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import { ObtenerComprobanteRecurrente } from '@screenplay/tasks/common/ObtenerComprobanteRecurrente';
import { CrearNotaCreditoConVinculacion } from '@screenplay/tasks/notas-credito/CrearNotaCreditoConVinculacion';
import { ModalPostEmisionVisible } from '@screenplay/questions/notas/ModalPostEmisionVisible';
import { TIPOS_DOCUMENTO_ORIGEN } from '@helpers/PuntoVenta/emision-data.helper';

test.describe('NC-02 | Motivos con Monto Directo', {tag: ['@puntoventa', '@nota-credito']}, () => {

  test('SC-01: Emitir NC por descuento global desde factura @NC-02.1', async ({ facturador, registrarNota }) => {
    const origen = await facturador.realizaYObtiene(
      ObtenerComprobanteRecurrente('FACTURA')
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
    registrarNota(resultado.numero, resultado.correlativo);

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-02: Emitir NC por disminución en el valor desde factura @NC-02.2', async ({ facturador, registrarNota }) => {
    const origen = await facturador.realizaYObtiene(
      ObtenerComprobanteRecurrente('FACTURA')
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
    registrarNota(resultado.numero, resultado.correlativo);

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-03: Emitir NC por otros conceptos desde boleta @NC-02.3', async ({ facturador, registrarNota }) => {
    const origen = await facturador.realizaYObtiene(
      ObtenerComprobanteRecurrente('BOLETA')
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
    registrarNota(resultado.numero, resultado.correlativo);

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });
});
