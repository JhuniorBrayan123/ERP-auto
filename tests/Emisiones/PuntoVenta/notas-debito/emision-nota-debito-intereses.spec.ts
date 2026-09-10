import {expect, test} from '@fixtures/PuntoVenta/comprobante-nc-nd.fixture';
import {ObtenerComprobanteRecurrente} from '@screenplay/tasks/common/ObtenerComprobanteRecurrente';
import {CrearNotaDebitoConVinculacion} from '@screenplay/tasks/notas-debito/CrearNotaDebitoConVinculacion';
import {ConsultarNotaDebito, VerDetalleNotaDebito} from '@screenplay/tasks/notas-debito/ConsultarNotaDebito';
import {ModalPostEmisionVisible} from '@screenplay/questions/notas/ModalPostEmisionVisible';
import {DetalleNotaDebitoCorrecto} from '@screenplay/questions/notas/DetalleNotaCorrecto';
import {ClickNuevaVenta} from '@interactions/PuntoVenta/ClickNuevaVenta';
import {IrABusquedaComprobantes} from '@task/PuntoVenta/IrABusquedaComprobantes.task';

test.describe('ND-02 | Intereses por Mora', {tag: ['@puntoventa', '@nota-debito']}, () => {

  test('SC-01: Emitir ND por intereses por mora vinculando una boleta @ND-02.1', async ({ facturador, registrarNota }) => {
    const origen = await facturador.realizaYObtiene(
      ObtenerComprobanteRecurrente('BOLETA')
    );

    const resultado = await facturador.realizaYObtiene(
      CrearNotaDebitoConVinculacion({
        tipoDocumento: 'Boleta',
        serie: origen.serie,
        correlativo: origen.correlativo,
        motivo: 'Intereses por mora',
        textoMotivo: 'Intereses por mora por automatización',
        monto: '10',
      })
    );
    registrarNota(resultado.numero);

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
    await expect(facturador.page.getByText(resultado.numero)).toBeVisible();
  });

  test('SC-02: Emitir ND por intereses por mora vinculando una factura @ND-02.2', async ({ facturador, registrarNota }) => {
    const origen = await facturador.realizaYObtiene(
      ObtenerComprobanteRecurrente('FACTURA')
    );

    const resultado = await facturador.realizaYObtiene(
      CrearNotaDebitoConVinculacion({
        tipoDocumento: 'Factura',
        serie: origen.serie,
        correlativo: origen.correlativo,
        motivo: 'Intereses por mora',
        textoMotivo: 'Intereses por mora desde factura',
        monto: '15',
      })
    );
    registrarNota(resultado.numero);

    await facturador.pregunta(ModalPostEmisionVisible());
    expect(resultado.numero).toMatch(/[A-Z]{1,4}\d{1,4}-\d+/);
  });

  test('SC-03: Consultar ND por intereses y verificar detalle en vista comprobante @ND-02.3', async ({ facturador, registrarNota }) => {
    const origen = await facturador.realizaYObtiene(
      ObtenerComprobanteRecurrente('BOLETA')
    );

    const resultado = await facturador.realizaYObtiene(
      CrearNotaDebitoConVinculacion({
        tipoDocumento: 'Boleta',
        serie: origen.serie,
        correlativo: origen.correlativo,
        motivo: 'Intereses por mora',
        textoMotivo: 'Intereses por mora para consulta posterior',
        monto: '10',
      })
    );
    registrarNota(resultado.numero);

    await facturador.realiza(ClickNuevaVenta());
    await facturador.realiza(IrABusquedaComprobantes());
    await facturador.realiza(ConsultarNotaDebito(resultado.correlativo));

    const popup = await facturador.realizaYObtiene(VerDetalleNotaDebito());

    await facturador.pregunta(
      DetalleNotaDebitoCorrecto(popup, {
        tipoDocumento: 'Nota de débito electrónica',
        tieneComprobanteVinculado: true,
        tipoNota: 'Intereses por mora',
        motivoEsperado: 'Intereses por mora para consulta posterior',
      })
    );

    await popup.getByRole('button', { name: /salir/i }).click();
  });
});
