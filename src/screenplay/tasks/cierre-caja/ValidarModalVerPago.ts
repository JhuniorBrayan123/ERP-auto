import { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { DatosDelPago } from '../../questions/cierre-caja/ComprobanteVisibleEnVentas';

/**
 * Task: ValidarModalVerPago
 * 
 * Valida que el modal "Ver Pago" muestre correctamente el título
 * (con el tipo de comprobante y su correlativo) y que exista
 * al menos un método de pago registrado.
 */
export const ValidarModalVerPago = (tipoDocumento: string, correlativo: string) => {
    const fn = async (page: Page): Promise<void> => {
        const modal = page.locator('.v-dialog, .v-modal, .modal-content, .modal, .payment-info').filter({ hasText: /pago/i }).first();

        // 1. Validar que el título coincida con el tipo y correlativo
        const correlativoLimpio = Number(correlativo).toString();
        const regex = new RegExp(`${tipoDocumento}.*${correlativoLimpio}`, 'i');
        await expect(modal.locator('.payment-info .v-text.v-h4.regular').first()).toHaveText(regex, { timeout: 5000 });

        // 2. Validar que tenga métodos de pago
        const metodosLocator = modal.locator('.method-name-date > span.v-text.success, .method-name-date span.bold');
        expect(await metodosLocator.count()).toBeGreaterThan(0);
    };

    fn.displayName = `Validar modal Ver Pago de ${tipoDocumento} - ${correlativo}`;
    return fn;
};
