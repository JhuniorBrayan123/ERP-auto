import type {Page} from '@playwright/test';
import {ClientePage} from '@pages/PuntoVenta/ClientePage';
import type {DatosCliente} from '@app-types/emision.types';

export interface DatosClienteCE {
    documento: string;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    textoSelector: string;
}

export async function asegurarClienteExtranjeria(
    page: Page,
    datosCE: DatosClienteCE
): Promise<DatosCliente & { textoSelector: string }> {
    const clientePage = new ClientePage(page);

    await clientePage.buscarCliente(datosCE.documento);
    const existe = await page.getByText(datosCE.textoSelector).isVisible();

    if (existe) {
        await clientePage.seleccionarClientePorTexto(datosCE.textoSelector);
    } else {
        await page.keyboard.press('Escape');

        await clientePage.crearClienteExtranjeria({
            documento: datosCE.documento,
            nombre: datosCE.nombre,
            direccion: datosCE.direccion,
            telefono: datosCE.telefono,
            email: datosCE.email,
        });
        await page.waitForResponse(response => response.url().includes('clientes') && response.request().method() === 'POST').catch(() => {
        });
        await page.waitForTimeout(1000);
    }
    return {
        tipoDocumento: 'Carnet Extranjeria',
        documento: datosCE.documento,
        nombre: datosCE.nombre,
        textoSelector: datosCE.textoSelector,
    };
}
