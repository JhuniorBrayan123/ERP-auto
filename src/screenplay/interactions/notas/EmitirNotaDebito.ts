import { expect, type Page } from '@playwright/test';
import { NotaDebitoTargets } from '../../targets/notas-debito/NotaDebitoTargets';
import type { ResultadoEmisionNota } from './EmitirNotaCredito';

export type { ResultadoEmisionNota };

/**
 * Interaction: Emitir Nota de Débito con pago normal.
 *
 * Hace click en Emitir, selecciona Monto exacto, y confirma "Realizar Pago".
 * ND usa "Realizar Pago" (no "Realizar devolución y emitir" como NC).
 *
 * Retorna los datos del comprobante emitido capturados desde la API.
 */
export const EmitirNotaDebitoConPago = () => {
  const fn = async (page: Page): Promise<ResultadoEmisionNota> => {

    const emisionPromise = page.waitForResponse(
      (resp) =>
        resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
      { timeout: 60_000 }
    );

    await NotaDebitoTargets.btnEmitir(page).click();
    await page.getByRole('button', { name: /monto exacto/i }).click();
    await page.getByRole('button', { name: /realizar pago/i }).click();


    const response = await emisionPromise;
    const body = await response.json();

    const nombrePdf: string = body.FilePdf?.Nombre ?? '';
    const partes = nombrePdf.split('-');
    const serie = partes[0] || '';
    const correlativo = String(body.CorrelativoDocumento ?? '');
    const correlativoConCeros = partes[1]?.replace('.pdf', '') || '';

    await expect(page.getByText('¡Buen trabajo!')).toBeVisible({ timeout: 15_000 });

    return {
      numero: `${serie}-${correlativoConCeros}`,
      serie,
      correlativo,
    };
  };

  fn.displayName = 'Emitir nota de débito con pago';
  return fn;
};
