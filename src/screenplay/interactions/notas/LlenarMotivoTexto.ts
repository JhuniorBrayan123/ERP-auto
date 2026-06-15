import type { Page } from '@playwright/test';
import { NotaCreditoTargets } from '../../targets/notas-credito/NotaCreditoTargets';
import { NotaDebitoTargets } from '../../targets/notas-debito/NotaDebitoTargets';

/**
 * Interaction: Llenar el motivo de texto libre.
 *
 * Funciona tanto para NC como para ND (ambos usan input de motivo).
 * El caller decide qué target usar según el contexto.
 */
export const LlenarMotivoNotaCredito = (motivo: string) => {
  const fn = async (page: Page): Promise<void> => {
    const input = NotaCreditoTargets.inputMotivo(page);
    await input.click();
    await input.fill(motivo);
  };

  fn.displayName = `Llenar motivo NC: "${motivo}"`;
  return fn;
};

export const LlenarMotivoNotaDebito = (motivo: string) => {
  const fn = async (page: Page): Promise<void> => {
    const input = NotaDebitoTargets.inputMotivo(page);
    await input.click();
    await input.fill(motivo);
  };

  fn.displayName = `Llenar motivo ND: "${motivo}"`;
  return fn;
};
