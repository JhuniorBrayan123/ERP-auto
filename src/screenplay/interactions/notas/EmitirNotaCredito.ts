import {expect, type Page} from '@playwright/test';
import {NotaCreditoTargets} from '../../targets/notas-credito/NotaCreditoTargets';

export interface ResultadoEmisionNota {
    numero: string;
    serie: string;
    correlativo: string;
}

export const EmitirNotaCreditoConDevolucion = (requierePagoModal: boolean = true) => {
    const fn = async (page: Page): Promise<ResultadoEmisionNota> => {

        const emisionPromise = page.waitForResponse(
            (resp) =>
                resp.url().includes('DocumentosContables/Emisiones') && resp.status() === 200,
            {timeout: 60_000}
        );

        await NotaCreditoTargets.btnEmitir(page).click();
        
        if (requierePagoModal) {
            await page.getByRole('button', {name: /monto exacto/i}).click();
            await NotaCreditoTargets.btnRealizarDevolucionYEmitir(page).click();
        }


        const response = await emisionPromise;
        const body = await response.json();

        const nombrePdf: string = body.FilePdf?.Nombre ?? '';
        const serie = nombrePdf.split('-')[0] || '';
        const partes = nombrePdf.split('-');
        const correlativo = String(body.CorrelativoDocumento ?? '');
        const correlativoConCeros = partes[1]?.replace('.pdf', '') || '';


        await expect(page.getByText('¡Buen trabajo!')).toBeVisible({timeout: 15_000});

        return {
            numero: `${serie}-${correlativoConCeros}`,
            serie,
            correlativo,
        };
    };

    fn.displayName = 'Emitir nota de crédito con devolución';
    return fn;
};
